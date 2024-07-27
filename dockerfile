# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright and its dependencies, including the browsers
RUN playwright install --with-deps

# Make port 8080 available to the world outside this container
EXPOSE 8080

# Define environment variable
ENV PORT 8080

# Run Gunicorn to serve the app
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "backend:app", "--workers", "3"]
