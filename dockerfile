# Use the official Playwright Docker image
FROM mcr.microsoft.com/playwright/python:v1.21.0-focal

# Install missing libraries
RUN apt-get update && apt-get install -y \
    libicu66 \
    libevent-2.1-7 \
    libjpeg8 \
    libenchant-2-2 \
    libsecret-1-0 \
    libffi7 \
    libgles2 \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Create directory for the app user
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Run the application
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "backend:app"]
