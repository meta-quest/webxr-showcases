# Project Structure and Developer Guide

This document provides a detailed overview of the project's file structure and a guide for developers to understand and work with the codebase.

## Project Structure

This section outlines the structure of the project files and their respective roles within the application.

### [`index.js`](./index.js)

- **Purpose**: The entry point of the game application.
- **Contents**:
  - Initialization code for game systems.
  - Starts the game loop and rendering process.

### [`global.js`](./global.js)

- **Purpose**: Defines global constants and components used throughout the game.
- **Contents**:
  - `GlobalComponent`: A component that holds references to the renderer, camera, and scene.
  - Constants: Paths for textures, scoring keys, and game state parameters.

### [`landing.js`](./landing.js)

- **Purpose**: Manages the landing page interface, particularly the VR and Web launch buttons.
- **Contents**:
  - `InlineSystem`: A system that sets up and manages the UI elements on the landing page.

### [`player.js`](./player.js)

- **Purpose**: Sets up the player's state and input handling.
- **Contents**:
  - `PlayerComponent`: Represents the player's state and attributes.
  - `PlayerSystem`: Manages the player's interactions and updates.

### [`scene.js`](./scene.js)

- **Purpose**: Initializes the main scene, camera, and renderer.
- **Contents**:

  - `setupScene`: A function that creates and configures the scene, camera, and lighting.

### [`flap.js`](./flap.js)

- **Purpose**: Handles the flapping mechanism and related game logic.
- **Contents**:
  - `FlapSystem`: Manages the player's flapping interaction and movement.

### [`game.js`](./game.js)

- **Purpose**: Contains the main game logic, including score management and state transitions.
- **Contents**:
  - `GameSystem`: Handles the game's logic and state management.

## Guide for Developers

### Initialization and Entry Point

- **Global Setup**: Begin by understanding `global.js` for an overview of the game's configuration.
- **Starting the Game**: `index.js` initializes the game systems and starts the game loop.

### Core Game Functionality

- **Scene Setup**: `scene.js` is responsible for the visual setup of the game.
- **Player Initialization**: `player.js` sets up the player's avatar and handles input.
- **Game State Management**: `game.js` oversees the game's logic, including scoring and game states.
- **Flapping Mechanics**: `flap.js` focuses on the player's movement and flapping controls.

### User Interface

- **Landing Page UI**: `landing.js` manages the UI on the landing page, including VR and Web launch buttons.

### Working with the Code

- To adjust global settings, modify `global.js`.
- For changes to the game's startup sequence, update `index.js`.
- To change the scene's visual elements, edit `scene.js`.
- For gameplay mechanics and logic, refer to `game.js` and `flap.js`.
- For UI adjustments, `landing.js` is the file to look at.
