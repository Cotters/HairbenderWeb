/**
 * AI prompt descriptions for each style ID.
 *
 * Each string is injected verbatim into the image-generation prompt via buildPrompt()
 * in /app/api/tryon/route.ts. Descriptions must be:
 *   - Technically precise (length, layer placement, texture, finish)
 *   - Phrased to describe the hair itself, not instructions to "cut" it
 *   - Unambiguous enough to produce consistent AI output
 */
export const STYLE_DESCRIPTIONS: Record<string, string> = {
  // ── The Paris Collection ────────────────────────────────────────────────

  "paris-01":
    "a chic jaw-length bob cut bluntly to fall precisely at the jawline. " +
    "The hair is sleek, smooth, and has a high-gloss mirror-like shine. " +
    "The ends are perfectly straight and sharp, with zero visible layers or feathering.",

  "paris-02":
    "an ultra-blunt glass cut where all the hair falls in one razor-sharp, " +
    "perfectly even horizontal line at chin level. The surface is pin-straight, " +
    "intensely glossy, and reflects light like polished glass. There is zero " +
    "layering — the entire cut is one unbroken, flat edge.",

  "paris-03":
    "a mid-length Italian lob (long bob) sitting just below the shoulders. " +
    "Soft, airy layers starting from the cheekbone create gentle outward movement " +
    "and a breezy, effortless flow. The ends are subtly feathered and slightly " +
    "rounded inward. The overall surface is smooth with a healthy sheen.",

  "paris-04":
    "a close-cropped French pixie cut with a micro fringe of short, straight bangs " +
    "that lightly graze the forehead just above the eyebrows. Hair is very short " +
    "on the sides and back — almost shaved — with slightly more textured length " +
    "on top. The overall silhouette is tight, neat, and purposefully minimal.",

  "paris-05":
    "a bixie cut — a hybrid between a bob and a pixie — with shaggy, piece-y " +
    "layers on top falling just above the jawline. The sides are short and " +
    "clean-cut, while the crown has playful, lightly tousled texture and soft " +
    "forward-sweeping volume. The cut reads as a very short, textured bob.",

  "paris-06":
    "a shoulder-length lob with heavy curtain bangs — soft, face-framing bangs " +
    "parted precisely at the center that sweep outward past the cheekbones and " +
    "blend seamlessly into long, flowing layers. The rest of the hair has " +
    "smooth, graduated layers that taper toward the ends with a sleek, polished finish.",

  "paris-07":
    "a luxuriously voluminous blowout with a large, rounded, bouncy silhouette. " +
    "The hair is blown to maximum fullness with a smooth, high-gloss surface " +
    "and sweeping inward curves at the ends — as if styled with a large round brush. " +
    "Roots are lifted for dramatic height. The overall shape is a sculpted dome: " +
    "glamorous, polished, and architecturally perfect.",

  // ── The Grunge Issue ────────────────────────────────────────────────────

  "grunge-01":
    "a heavily layered shag cut with dense, choppy layers distributed from " +
    "roots to ends throughout the entire length. The hair has an intentionally " +
    "undone, lived-in texture with high visible volume, multi-directional movement, " +
    "and deliberate messiness. Wispy, curtain-style bangs frame the face.",

  "grunge-02":
    "a razor-cut style with aggressively uneven, staggered layers that create " +
    "stark textural contrast. The ends are deliberately raw, jagged, and " +
    "rough-edged — as if cut with a razor blade rather than scissors. " +
    "Deep, dimensional variation between thick and thin sections produces a " +
    "high-contrast, sculptural look.",

  "grunge-03":
    "a modern soft mullet: hair is cropped short and textured on the crown " +
    "and sides, then gradually and deliberately extends into longer lengths " +
    "at the back and nape. The longer back section falls loosely with light " +
    "texture. The top has loose, effortless piece-y texture — not slicked, " +
    "not polished, just naturally dishevelled.",

  "grunge-04":
    "choppy, broken fringe cut asymmetrically across the forehead with " +
    "deliberately uneven, raw edges. The bangs are thick, textured, and fall " +
    "in irregular, disconnected segments across the brow. The rest of the hair " +
    "is mid-length with rough, choppy layering.",

  "grunge-05":
    "a wolf cut combining the volume of a 70s shag with the shape of a modern " +
    "mullet. Heavy, face-framing curtain bangs fall to the cheekbones and blend " +
    "into thick, choppy layers that build maximum volume at the crown and " +
    "gradually elongate toward the back and sides. The ends are deliberately " +
    "wispy and disconnected. The overall silhouette is wide at the crown, " +
    "tapering to longer, looser ends.",

  "grunge-06":
    "a short textured crop with a blunt, heavy fringe cut straight across " +
    "the forehead just above the eyebrows. The crown section has rough, " +
    "piece-y texture with deliberate forward-falling volume. The sides and " +
    "back are closely cropped with a subtle skin fade, creating a stark " +
    "contrast between the textured top and the clean, bare sides.",

  "grunge-07":
    "a dramatic chin-length blunt cut with a thick, dense straight-across " +
    "fringe cut high on the forehead — reminiscent of dark pin-up and " +
    "rockabilly aesthetics. The sides fall clean and severe, curving very " +
    "slightly inward at the ends. The overall silhouette is bold, rounded, " +
    "and architecturally assertive.",

  // ── The Executive ───────────────────────────────────────────────────────

  "exec-01":
    "a clean professional taper with a tight, gradual skin fade on the sides " +
    "and back that blends into short, neatly combed hair on top. The fade " +
    "starts low near the ears and diminishes to bare skin at the neckline. " +
    "The top is short, controlled, and combed to one side. The overall look " +
    "is polished, restrained, and corporate.",

  "exec-02":
    "a sharp contour fade with precisely defined, crisp edges traced along " +
    "the entire hairline, temple, and sideburn. The fade drops to nearly " +
    "skin-bare at the lowest point and transitions sharply to a short, " +
    "neat top section. Every edge is geometric and razor-defined.",

  "exec-03":
    "a classic side part with a hard, sharply defined part line scored " +
    "from front to back. Hair on both sides is neatly combed flat, smooth, " +
    "and polished with a subtle pomade-like sheen. The smaller side is " +
    "pressed close to the scalp; the larger side sweeps neatly across. " +
    "The look is clean, structured, and timeless.",

  "exec-04":
    "an executive crop with a tidy top section featuring subtle controlled " +
    "texture and soft volume pushed slightly forward. The sides are short " +
    "and clean-cut with a low taper, blending smoothly up into the textured " +
    "crown. The overall look is professional but slightly modern — controlled " +
    "disorder at the top, discipline everywhere else.",

  "exec-05":
    "a bold high skin fade starting at the temples and receding to bare skin. " +
    "The fade is extreme — the sides and back are almost entirely shaved, " +
    "leaving only a short, defined top section. The contrast between bare " +
    "skin and the top is dramatic. The hairline and sideburns are sharply " +
    "edge-lined for a precise, surgical finish.",

  "exec-06":
    "a classic slick-back hairstyle with all the hair swept straight back " +
    "from the forehead — no part, no fringe. The surface is smooth, tight, " +
    "and intensely glossy as if finished with heavy pomade. Every strand " +
    "is trained flat and rearward. The sides have a subtle low taper. " +
    "The result projects control and authority.",

  "exec-07":
    "an Edgar cut with a perfectly ruler-straight horizontal fringe line " +
    "cut just above the eyebrows — a crisp, architectural front edge with " +
    "zero taper or curve. The sides have a precise high fade with sharp " +
    "edge work at the temples. The top section is dense with controlled, " +
    "horizontal brushed-forward texture and firm volume.",

  // ── The Coastal Edit ────────────────────────────────────────────────────

  "coastal-01":
    "a mid-length lob styled with loose, effortless beach waves falling " +
    "just below the collar. The waves are soft and tousled with natural, " +
    "irregular variation in their pattern — not uniform curls. The texture " +
    "has a slightly dry, salty, lived-in quality with soft separation " +
    "between sections and a subtle, natural sheen.",

  "coastal-02":
    "long hair falling well past the shoulders with deep, sweeping undulating " +
    "waves — like ocean swells. The waves are large-scale, smooth, and " +
    "flowing with gentle, alternating crests. The hair appears weightless " +
    "and flowing, with a natural sheen and soft, long layers that follow " +
    "the wave movement without interrupting it.",

  "coastal-03":
    "shoulder-length hair with deliberate tousled, lived-in texture — as if " +
    "air-dried naturally after swimming. The surface is slightly roughened " +
    "with soft separation between sections and a dimensional, relaxed look. " +
    "The ends bend in varying directions with no uniform curl pattern. " +
    "The result is casually beautiful and effortlessly textured.",

  "coastal-04":
    "medium to long hair with a clean center part falling into natural, " +
    "relaxed curtain bangs that sweep outward past the cheekbones. The " +
    "rest of the hair has gentle, effortless bends and natural waves. " +
    "The look is casually handsome — the quintessential surfer aesthetic " +
    "with unhurried, natural movement throughout.",

  "coastal-05":
    "a butterfly cut with long, face-framing layers that start short at " +
    "the crown and grow progressively longer toward the ends. The layers " +
    "create a dramatic, fluttering silhouette that fans outward around the " +
    "face and shoulders. Soft curtain bangs blend into the top layers. " +
    "The texture is airy and dimensional — full of natural movement.",

  "coastal-06":
    "long, face-framing layers cut to feather softly around the face and " +
    "fall past the shoulders. The layers are wispy and airy at the ends, " +
    "styled with a gentle windswept quality — lightly tousled and full of " +
    "romantic, effortless movement. The overall silhouette is elongated " +
    "and flowing.",

  // ── The Curl Manifesto ──────────────────────────────────────────────────

  "curl-01":
    "a full, rounded natural Afro with tight, springy 4C coil texture. " +
    "The hair forms a symmetrical spherical halo of dense, defined coils " +
    "radiating outward from the scalp in all directions. The volume is " +
    "dramatic and even, with consistent coil definition and a cloud-like " +
    "softness throughout the entire silhouette.",

  "curl-02":
    "a shoulder-length lob styled with defined, bouncy 3B/3C curls. Each " +
    "curl is a distinct, springy spiral with a consistent pattern. Long " +
    "layers remove excess bulk and allow the curls to fall in neat, " +
    "separate spirals. The hair has a glossy, healthy sheen and the " +
    "silhouette is rounded and full at the sides.",

  "curl-03":
    "an expansive, maximalist natural Afro with enormous volume — hair " +
    "extends dramatically outward from the scalp forming a wide, towering " +
    "halo of dense, fluffy, visibly soft texture. The coils are compact " +
    "and cloud-like. The silhouette is bold, powerful, and symmetrical, " +
    "projecting maximum natural volume.",

  "curl-04":
    "a curly shag cut with heavy layers distributed from crown to ends to " +
    "give curly hair deliberate bounce and dimension. Layers range from " +
    "short at the crown to longer at the sides and back. Soft curtain bangs " +
    "blend into the layered structure. The curls spring outward at each " +
    "layer break, creating a voluminous, multi-dimensional silhouette.",

  "curl-05":
    "shoulder-length hair styled with large, loose spiral curls — 3A/3B " +
    "pattern — with generous, defined corkscrew ringlets that are bouncy " +
    "and voluminous. The spirals have a glossy, healthy sheen. Long layers " +
    "prevent the curls from massing too heavily, creating an elongated, " +
    "dynamic, and lively silhouette.",

  "curl-06":
    "a chin-length bob styled with tight, defined ringlet curls — 3C/4A " +
    "pattern. The curls are compact and springy, forming neat ringlets " +
    "that frame the face. The cut is rounded at the bottom with subtle " +
    "layers to prevent bulk. The overall silhouette is structured and " +
    "polished with the curl definition doing all the work.",

  // ── The Retro Archive ───────────────────────────────────────────────────

  "retro-01":
    "long, flowing 1970s feathered hair styled outward and backward in " +
    "symmetrical, sweeping wings on both sides of the face. The layers " +
    "are blown back and away from the face in a wide, dramatic arc. " +
    "The center carries a soft natural part. The overall silhouette is " +
    "broad and windswept with a warm, voluminous, decade-perfect energy.",

  "retro-02":
    "the iconic 90s layered cut: a mid-length style with graduated layers " +
    "that flip outward at the ends. The top section has body-boosting " +
    "layers with subtle volume lift. The longest layer sits just above " +
    "the collarbone. The ends curve outward in a signature flip. The " +
    "overall effect is layered, dimensional, and distinctly 1990s.",

  "retro-03":
    "a 1960s bouffant with dramatically elevated, densely teased crown " +
    "volume. The top and crown section is lifted high above the head with " +
    "a full, round dome of volume, while the sides are smooth and " +
    "swept-back. The overall silhouette is a towering, formal, rounded " +
    "shape — architecturally bold and period-perfect.",

  "retro-04":
    "a 1920s finger wave bob with sculpted, precise S-curve waves set " +
    "close to the scalp. The waves form neat, uniform ridges that flow " +
    "in alternating arcs across the head. The hair is sleek, smooth, " +
    "and lacquered-looking with a deep, glossy sheen and flawless " +
    "wave definition from root to ends.",

  "retro-05":
    "a voluminous 1970s-inspired cut with dramatic side-swept wings — " +
    "long, layered hair feathered into large, sweeping arcs on both " +
    "sides of the face. The wings are blown out with substantial volume " +
    "and lift, flicking back and outward emphatically. The overall " +
    "silhouette is wide, glamorous, and unmistakably 70s.",

  "retro-06":
    "a 1980s-inspired big hair cut with maximum volume and dramatic " +
    "layering throughout. The crown and top are full and high with " +
    "voluminous, permed-looking texture. Layers cascade outward with " +
    "an exaggerated, wide silhouette. The overall look is bold, " +
    "larger-than-life, and full of confident, unapologetic 80s energy.",
};
