# ReadTheRoom

**ReadTheRoom** is an AI-driven text adventure game. Players must read the situation, understand the context across various scenarios and characters, and make the right choices. 

This repository is structured as a monorepo, managing both the frontend (mobile app) and backend (server) code together.

## Project Structure

- `/ReadTheRoom.App` : Expo-based React Native mobile app.
- `/Server` (or your backend folder name) : Serverless backend built with .NET 8 Azure Functions (Isolated Worker).

---

## App (Frontend)

A cross-platform mobile app developed using [Expo](https://expo.dev).

### Get started

1. Navigate to the app directory and install dependencies:
   ```bash
   cd ReadTheRoom.App
   npm install