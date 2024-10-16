# Flap Frenzy

Welcome to Flap Frenzy, an immersive and interactive WebXR experience. In this game, players navigate their character through a series of shrinking target rings by physically flapping their arms and adopting different poses. This dynamic and engaging experience is designed to get you moving and test your coordination and timing skills.

![Flap Frenzy Gameplay](./flap-frenzy.gif)

> Assets by [Synty Studio](https://www.syntystudios.com/)

## Table of Contents

- [Flap Frenzy](#flap-frenzy)
  - [Table of Contents](#table-of-contents)
  - [How to Play](#how-to-play)
  - [Getting Started](#getting-started)
  - [Project Architecture Overview](#project-architecture-overview)
    - [Three.js and WebXR Support](#threejs-and-webxr-support)
    - [Entity-Component-System (ECS) Architecture](#entity-component-system-ecs-architecture)
    - [3D Asset Workflow](#3d-asset-workflow)

## How to Play

- **Arm Flapping**: Flap your arms to make the character ascend.
- **Glide**: Extend your arms horizontally to glide and maintain altitude.
- **Dive**: Tuck your arms to dive and lose altitude quickly.
- **Objective**: Pass through as many target rings as possible. The rings decrease in size as you advance, increasing the difficulty.

## Getting Started

To set up your development environment and start playing Flap Frenzy, follow these steps:

1. Clone the repository:
   ```sh
   git clone https://github.com/felixtrz/flap-frenzy.git
   ```
2. Navigate to the project directory:
   ```sh
   cd flap-frenzy
   ```
3. Install the required dependencies using npm:
   ```sh
   npm install
   ```
4. To start a local development server, run:
   ```sh
   npm run serve
   ```
   This will compile the project and open it in your default web browser.
5. To create a production build, run:
   ```sh
   npm run build
   ```
   The build artifacts will be stored in the `dist/` directory.

## Project Architecture Overview

> For a detailed breakdown of the project's structure and a developer's guide, please see the [Project Structure & Developer Guide](./src/README.md) in the `src` directory.

Flap Frenzy is an example of combining web technologies with game design patterns to create immersive experiences. Below is an outline of the key architectural elements:

### Three.js and WebXR Support

The game's 3D rendering and interactive capabilities are powered by Three.js, with its robust WebXR support enabling immersive VR experiences. This integration allows us to tap into the full potential of virtual reality, providing a seamless and intuitive gameplay experience that is both performant and visually enjoyable.

### Entity-Component-System (ECS) Architecture

Our use of an ECS architecture is exemplified by the `PlayerComponent` and `PlayerSystem`. The `PlayerComponent` holds the state and attributes of the player, while the `PlayerSystem` handles input and updates the player's state. This separation of data and logic facilitates a modular and maintainable codebase, allowing for easy iteration and expansion of game features.

### 3D Asset Workflow

Blender is a powerful 3D modeling software and our tool of choice for creating and editing 3D assets. To optimize these assets for the web, we employ gltf-transform, which compresses meshes and textures with minimal sacrifice in quality. This streamlined workflow is crucial for maintaining high performance and fast load times, essential for the smooth operation of WebXR experiences.
