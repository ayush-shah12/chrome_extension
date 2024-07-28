# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . .

# Install Node.js
RUN apt-get update && apt-get install -y wget gnupg
RUN wget -q -O - https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get install -y nodejs

# Install Playwright and its dependencies, including the browsers
RUN pip install --no-cache-dir -r requirements.txt
RUN npm install -g playwright

# Set environment variable to ensure Playwright installs browsers in the correct path
ENV PLAYWRIGHT_BROWSERS_PATH=/usr/lib/playwright
RUN mkdir -p /usr/lib/playwright

# Install Playwright browsers
RUN npx playwright install --with-deps

# Optionally set PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD if you want to skip browser download in further installs
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

# Run Gunicorn to serve the app
CMD ["gunicorn", "--bind", "0.0.0.0:$PORT", "backend:app", "--workers", "3"]
