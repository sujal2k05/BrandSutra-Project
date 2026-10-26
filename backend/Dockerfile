# Multi-stage Dockerfile for BrandSutra Spring Boot Backend
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /workspace/app

COPY pom.xml .
COPY src src

# Build package skipping tests for docker layer caching
RUN apk add --no-cache maven && \
    mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
VOLUME /tmp
WORKDIR /app

# Copy executable jar from builder
COPY --from=builder /workspace/app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
