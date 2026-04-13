# AUDIT.md

## Repository Audit: Orta

### Score: 7/10

## Overall evaluation

This repository has a solid base and shows real project development, but it still needs cleanup and documentation improvements to look fully professional and refactor-ready.

### 1. README quality
The repository README is currently too minimal and does not explain the project clearly. It should include the project goal, features, setup steps, usage, and technology stack.

### 2. Folder structure
The actual project is organized inside the `Orta/` directory and is split into `backend` and `frontend`, which is a good architectural decision for a full-stack project.  
The backend already has a more structured internal layout with folders such as `core`, `models`, `routers`, `schemas`, and `services`.  
The frontend also has a reasonable structure with `src`, `public`, `components`, `pages`, and assets.

### 3. File naming consistency
Most file and folder names are understandable and follow common naming practices. The project is easier to navigate than a flat repository with everything in one place.

### 4. Essential files
Some essential files are present, such as backend dependencies and frontend package files, but the repository still needs a stronger top-level README and should ensure all required documentation files are included for submission.

### 5. Commit history quality
The repository contains active development work, but professionalism is not only about code. The documentation and presentation of the repository still need improvement so another student or reviewer can understand it quickly.

## Strengths
- Clear separation between backend and frontend
- Backend already follows layered project structure
- Frontend uses modern React + Vite tooling
- The project appears to implement real application logic, not only a template

## Weaknesses
- Top-level README is incomplete
- The frontend README is still the default Vite template and does not describe the actual project
- The repository root is not yet fully polished for presentation
- Documentation is not sufficient for someone opening the project for the first time
- There is not yet a visible `tests` folder or dedicated project documentation folder for architecture, API notes, or setup guidance


## Final comment
Orta is already a real full-stack project with a good technical base. Its main issue is not the lack of code, but the lack of repository presentation and documentation. After improving the README and cleaning the top-level structure, this repository can look much more professional.