# Migration / 候鸟

> A Canvas-based 3D generative art experience exploring environmental transitions, Boids flocking algorithms, and immersive audio-visual synchronization. 
> 
> *Generated entirely through AI pair-programming with Claude Fable 5.*

## Overview

**Migration** is an interactive web experiment built purely with HTML5 Canvas and vanilla JavaScript (zero external rendering libraries). It simulates a flock of birds migrating across various stylized low-poly environments. 

The project demonstrates:
- **Custom 3D Rendering Pipeline**: Matrix transformations, backface culling, and Painter's algorithm implemented from scratch.
- **Boids Flocking Simulation**: A robust implementation of Craig Reynolds' Boids algorithm (separation, alignment, cohesion) optimized for real-time 3D flocking.
- **Audio-Visual Immersion**: Dynamic environmental soundscapes (wind, rivers) synthesized using `AudioContext` filters, blended with high-fidelity background tracks.

## Features

- **5 Distinct Themes**: WARM (暖纸), DUSK (暮粉), NIGHT (夜航), MIST (晨雾), and SNOW (雪境).
- **Interactive Camera**: Switch between an auto-tracking cinematic camera or free-look mouse control.
- **Screen Wake Lock**: Prevents mobile devices from sleeping during the experience.
- **Dynamic Orientation**: Auto-locks to landscape mode on mobile for the best cinematic viewing.

## Running Locally

Because this project uses the `fetch` API to load local `.mp3` assets, opening `index.html` directly (via `file://` protocol) might trigger CORS restrictions in some browsers. 

To view it locally, run a simple HTTP server. For example:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve
```
Then open `http://localhost:8000` in your browser.

## AI Creation

This project is a testament to the power of modern Agentic AI workflows. The core logic, 3D engine, UI, and Boids algorithm were generated autonomously by **Claude Fable 5**, Anthropic's state-of-the-art coding model, directed and engineered by the user. 

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
<img width="1033" height="467" alt="image" src="https://github.com/user-attachments/assets/b23a6d1c-01f1-4a09-ac5b-7a2b72b17951" />
<img width="1028" height="415" alt="image" src="https://github.com/user-attachments/assets/c808f0ea-4644-4998-a90c-2446f53fb505" />
<img width="1023" height="410" alt="image" src="https://github.com/user-attachments/assets/3cb29df5-5759-489c-bf23-cc29ddc320a5" />
