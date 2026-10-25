# Build stage
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /workspace

# Copy gradle wrapper and config
COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle ./

# Fix line endings on gradlew
RUN sed -i 's/\r$//' gradlew && chmod +x gradlew

# Copy source code and build jar
COPY src src
RUN ./gradlew bootJar --no-daemon -x test

# Runtime stage (ultra-lightweight JRE Alpine)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Security: run as unprivileged user
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy built jar
COPY --from=builder /workspace/build/libs/*.jar app.jar

EXPOSE 8080

# Optimized JVM memory flags for free-tier 512MB RAM containers
ENV JAVA_OPTS="-XX:+UseSerialGC -Xss512k -XX:MaxRAMPercentage=75"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
