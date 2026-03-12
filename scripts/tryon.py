import base64
import os
import sys

import cv2
import numpy as np
import requests
import xai_sdk


def _face_info(img_bgr):
    """
    Returns (face_center, face_size, eye_centers_or_None).
    face_center : (cx, cy) in pixels
    face_size   : average of face w and h
    eye_centers : [(lx, ly), (rx, ry)] sorted left-to-right, or None
    """
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    )
    eye_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + "haarcascade_eye.xml"
    )

    faces = face_cascade.detectMultiScale(
        gray, scaleFactor=1.1, minNeighbors=4, minSize=(60, 60)
    )
    if len(faces) == 0:
        return None, None, None

    # Use the largest detected face
    fx, fy, fw, fh = max(faces, key=lambda f: f[2] * f[3])
    face_center = (float(fx + fw / 2), float(fy + fh / 2))
    face_size = float((fw + fh) / 2)

    # Look for eyes in the upper 60 % of the face region
    roi = gray[fy : fy + int(fh * 0.6), fx : fx + fw]
    eyes = eye_cascade.detectMultiScale(roi, scaleFactor=1.1, minNeighbors=5)

    eye_centers = None
    if len(eyes) >= 2:
        eyes_sorted = sorted(eyes, key=lambda e: e[0])[:2]
        eye_centers = [
            (float(fx + ex + ew / 2), float(fy + ey + eh / 2))
            for (ex, ey, ew, eh) in eyes_sorted
        ]

    return face_center, face_size, eye_centers


def align_to_reference(orig_bgr, result_bgr):
    """
    Warp result_bgr so its face aligns with orig_bgr's face.

    Tier 1 – eyes detected in both  : full similarity transform
             (translation + rotation + uniform scale)
    Tier 2 – only face box available: scale + translation using face centres
    Tier 3 – no face detected at all : plain resize to match dimensions
    """
    h, w = orig_bgr.shape[:2]

    orig_fc, orig_fs, orig_eyes = _face_info(orig_bgr)
    res_fc, res_fs, res_eyes = _face_info(result_bgr)

    # ── Tier 1: full similarity transform via eye centres ──────────────────
    if orig_eyes is not None and res_eyes is not None:
        src = np.float32(res_eyes)
        dst = np.float32(orig_eyes)
        M, _ = cv2.estimateAffinePartial2D(src, dst)
        if M is not None:
            return cv2.warpAffine(
                result_bgr, M, (w, h),
                flags=cv2.INTER_LANCZOS4,
                borderMode=cv2.BORDER_REPLICATE,
            )

    # ── Tier 2: scale + translate via face-box centres ─────────────────────
    if orig_fc is not None and res_fc is not None and res_fs and orig_fs:
        s = orig_fs / res_fs
        tx = orig_fc[0] - s * res_fc[0]
        ty = orig_fc[1] - s * res_fc[1]
        M = np.float32([[s, 0, tx], [0, s, ty]])
        return cv2.warpAffine(
            result_bgr, M, (w, h),
            flags=cv2.INTER_LANCZOS4,
            borderMode=cv2.BORDER_REPLICATE,
        )

    # ── Tier 3: no face found – resize only ────────────────────────────────
    return cv2.resize(result_bgr, (w, h), interpolation=cv2.INTER_LANCZOS4)


# ── main ──────────────────────────────────────────────────────────────────────

api_key    = os.environ["XAI_API_KEY"]
image_path = sys.argv[1]
prompt     = sys.argv[2]

client = xai_sdk.Client(api_key=api_key)
ext    = os.path.splitext(image_path)[1].lower()
mime   = "image/png" if ext == ".png" else "image/jpeg"

with open(image_path, "rb") as f:
    image_data = base64.b64encode(f.read()).decode("utf-8")

response = client.image.sample(
    prompt=prompt,
    model="grok-imagine-image",
    image_url=f"data:{mime};base64,{image_data}",
)

# Download result image
result_bytes = requests.get(response.url).content

# Decode both images for CV processing
orig_bgr   = cv2.imread(image_path)
result_arr = np.frombuffer(result_bytes, dtype=np.uint8)
result_bgr = cv2.imdecode(result_arr, cv2.IMREAD_COLOR)

# Align result face to original face position
aligned_bgr = align_to_reference(orig_bgr, result_bgr)

# Output as base64 PNG on stdout — Node.js reads this directly
_, buf = cv2.imencode(".png", aligned_bgr)
print(base64.b64encode(buf.tobytes()).decode("utf-8"))
