# tesla-proxy/Dockerfile
FROM golang:1.23-alpine AS builder

# Install git
RUN apk add --no-cache git

# Clone the official Tesla repository
WORKDIR /app
RUN git clone https://github.com/teslamotors/vehicle-command.git .

# Build the proxy binary
RUN go build ./cmd/tesla-http-proxy

# --- Final Stage ---
FROM alpine:latest
WORKDIR /root/

# Install OpenSSL to generate a self-signed certificate
RUN apk add --no-cache openssl

# Generate a self-signed certificate for the proxy server (valid for 365 days)
# This creates 'server-cert.pem' and 'server-key.pem'
RUN openssl req -new -newkey rsa:2048 -days 365 -nodes -x509 \
    -keyout server-key.pem -out server-cert.pem \
    -subj "/CN=localhost"

# Copy the binary from the builder
COPY --from=builder /app/tesla-http-proxy .

# Copy your Tesla Command Signing Key
COPY private-key.pem .

# Expose the port
EXPOSE 8080

# Run the proxy with the self-signed certificate
CMD ./tesla-http-proxy \
    -key-file private-key.pem \
    -cert server-cert.pem \
    -tls-key server-key.pem \
    -host 0.0.0.0 \
    -port 8080 \
    -verbose