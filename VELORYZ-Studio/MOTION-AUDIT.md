# VELORYZ Studio motion audit

## Homepage sculpture

The model follows both outlines of the original VELORYZ mark. Each shard has a recessed spine, five polished edge ribs, beveled enamel caps and colored facets on both faces. The assembled mark measures approximately 2.53 × 2.29 × 0.81 model units. The same geometry powers the interactive stage and the downloadable GLB.

Drag diagonally, horizontally or vertically across the logo. The object stays at the angle where you release it. Arrow keys turn it 15 degrees, Shift plus an arrow turns it 45 degrees, and Home brings it back to the front. The Front, Orbit, Explode, Solid, Glass and Wire controls remain available. The surrounding frame lets touch users scroll the page.

## Scroll studies

| Location | Interaction |
| --- | --- |
| Motion Playground, 3D assembly study | Scroll from the complete mark to the spread layers and through to the reverse face. Scroll upward to reassemble it in reverse. A ruler tracks the same progress as the sculpture. |
| Homepage hero and reel | The logo turns as it leaves the viewport. The reel travels vertically inside its frame and the ticker moves horizontally with the page. |
| Interface studies | The cards rotate by different amounts as they pass the reading position. The text sits outside the moving preview. |
| Studio and services | The small studio facts move in opposite directions. Opening a service reveals a floor that turns with scrolling. |
| Playground material studies | Each swatch orbit turns and changes scale with its section. |

Existing motion preferences govern ambient and scroll animation. Visitors who use reduced motion can activate the inspection controls deliberately. Scenes are mounted near the viewport and drawing stops offscreen or while the document is hidden. Browsers without WebGL can inspect the same geometry through a software renderer.

## Verification

- The local server returned HTTP 200 for the home, work, design, journey, motion, create, studio, book and pricing routes.
- A desktop browser rendered the layered pink and blue V. A diagonal drag changed the visible faces and exposed the ribs. Keyboard rotation and Home were exercised.
- In the assembly study, scrolling forward moved the measured progress from 14% to 84%. Reversing direction brought it back to 38%.
- The assembly layout fit the 320 px and 390 px preview widths without horizontal page overflow.
- The production build, full project suite, motion suite and production-response tests passed. Geometry checks cover the five ribs on each shard, depth, GLB round-trip, full turns around both axes and keyboard reset.
- The browser used the software renderer. Hardware-accelerated appearance and physical-device frame rates were not measured.

## Preview and local development

Open VELORYZ-Motion-Preview.html in a current browser. Select Hero to rotate the logo. Select 3D assembly study to scroll through its construction. The preview embeds the public assets and runs offline. Enquiries, AI and CMS operations require the full project server.

Follow START-HERE.md to run the complete app. This archive builds on the previous motion and layout upgrade and preserves its public settings and integrations. Verification used a local live server.
