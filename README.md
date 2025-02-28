# capstone-project-2024-t3-3900h11adigitalhaven

For guidance on using the product, refer to the [User Guide](User%20Guide.pdf).

For a detailed explanation of the system, see the [Software Design Documentation](Software%20Design%20Documents.pdf).

For system diagrams, consult the [System Architectural Diagrams](System%20Architectural%20Diagrams.pdf).

## How to Run the App with Docker

1. Clone the Repository to your machine.
2. Navigate into the backend and open the .env file.
3. Fill in the environment variables in the .env file.
4. Navigate to the main directory in the terminal.
5. Run:

```bash
docker compose up --build
```

6. To load the frontend open ‘localhost:3000’ in the browser.
7. After the first launch the docker can be started by running:

```bash
docker compose up
```

## Backend Testing

To install the dependencies for the back navigate to the backend directory in the terminal and run

```bash
pip install -r requirements.txt
```

To run tests for the backend the AI engine must also be running to do this Navigate from the main directory to the ml directory. In the terminal then run:

```bash
uvicorn app.main:app
```

If the command does not work then use:

```bash
python -m uvicorn app.main:app
```

Then to run tests on the backend from the backend directory run:

```bash
pytest
```

or

```bash
python -m pytest
```

## AI Model Installation and Testing Guide

To install the dependencies for the ai go into the ml/ directory and run

```bash
pip install -r requirements.txt
```

To run tests for AI models, follow the instructions below:

### Classification Model Tests

To verify the performance and accuracy of the classification model, navigate to the `ml` directory and execute the following command:

```bash
cd mlpytest test/classification_test.py
```

### Object detection model tests

To ensure the functionality and accuracy of the detection model, use the following command after navigating to the ml directory:

```bash
cd mlpytest test/detection_test.py
```

## Front-end Installation, Operation and Testing guide

To run the front-end of this system without using docker, please following the instruction below

### Installation and Operation

To install and use this product frontend, navigate to the `frontend` directory and execute the following command:

```bash
npm install
npm start
```

### Front-end end-to-end Testing

To test the front-end operations and components, use the following command after navigating to the `frontend` directory and installing cypress:

```bash
npx cypress open
```

After cypress being loaded, select 'end-to-end testing' and select the desired test for testing. Please note the front-end testing must only be conducted when the docker is running.
