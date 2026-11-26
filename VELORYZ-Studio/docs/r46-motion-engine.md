# R46 — Motion Engine 3.0

The reference homepage now loads the same pinned local Lenis runtime as the application shell. Native touch, nested scroll regions, hash navigation and reduced-motion choices remain intact. A shared keyed clock coordinates homepage, Lenis and sculpture rendering. The clock cancels pending work on hidden pages and tears down old Lenis subscriptions. The 3D renderer lowers resolution after sustained slow frames without changing geometry or materials. The scarf remains muted native video with stale-play protection. Review animation remains a measured WAAPI loop with offscreen and route lifecycle cleanup.

Verification: run test-motion-clock, test-smooth-motion, test-frame-cut, test-reference-site-upgrade and the production workflow. Real-device frame timing and visual QA are required before any performance guarantee.
