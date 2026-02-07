# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Copy dependency file and source (go.sum not in repo; run 'go mod tidy' locally and commit go.sum for better cache)
COPY go.mod ./
COPY . .
RUN go mod tidy && CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# Production stage - minimal base, pinned for reproducibility
FROM alpine:3.19

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy the binary from builder
COPY --from=builder /app/main .

# Copy tasks.json from builder
COPY --from=builder /app/tasks.json .

# Expose port
EXPOSE 3001

# Run the application
CMD ["./main"]
