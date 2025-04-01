# ./worker/Dockerfile
FROM gradle:7.3-jdk11 AS build
WORKDIR /app
COPY . .
RUN gradle build --no-daemon

FROM openjdk:11-jre-slim
WORKDIR /app
COPY --from=build /app/build/libs/worker-1.0.0.jar .
CMD ["java", "-jar", "worker-1.0.0.jar"]