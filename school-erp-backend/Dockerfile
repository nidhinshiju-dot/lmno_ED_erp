# ─────────────────────────────────────────────────────────────────────────────
# School ERP — Root Dockerfile
# Build context: school-erp-backend root directory
# ARG SERVICE: the Maven module name (e.g. auth-service, core-service)
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-21 AS builder

ARG SERVICE
WORKDIR /app

# Copy root parent pom first (child modules inherit from it)
COPY pom.xml ./pom.xml

# Copy all module sources so -am can resolve upstream deps
COPY api-gateway  ./api-gateway
COPY auth-service ./auth-service
COPY core-service ./core-service
COPY lms-service  ./lms-service
COPY fee-service  ./fee-service

# Build target service + its dependencies (-am = also make)
# spring-boot:repackage runs as part of the package lifecycle
RUN mvn clean package -DskipTests -pl ${SERVICE} -am

# List what was built (useful for debugging)
RUN echo "== Built jars in ${SERVICE}/target ==" && ls -lh /app/${SERVICE}/target/*.jar 2>/dev/null || true

# ── Stage 2: Runtime ────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine

ARG SERVICE
WORKDIR /app

# Spring Boot maven plugin produces:
#   <artifactId>-<version>.jar       → the repackaged fat jar (executable)
#   <artifactId>-<version>.jar.original → the original thin jar
# We want the fat jar (no .original suffix), excluding the thin one.
RUN --mount=type=bind,from=builder,source=/app,target=/build \
    find /build/${SERVICE}/target -maxdepth 1 -name "*.jar" ! -name "*.jar.original" \
    -exec cp {} /app/app.jar \;

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
