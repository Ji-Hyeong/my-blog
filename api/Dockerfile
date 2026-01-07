# syntax=docker/dockerfile:1
#
# apps/api Dockerfile
#
# 목적:
# - Spring Boot(Kotlin) 애플리케이션을 컨테이너로 빌드/배포(ECS Fargate)하기 위한 Dockerfile입니다.
#
# 설계:
# - 멀티 스테이지 빌드로 “빌드 도구(Gradle)”와 “런타임(JRE)”를 분리해 이미지 크기를 줄입니다.
# - Gradle wrapper를 사용해 로컬/CI/컨테이너에서 동일한 빌드 결과를 보장합니다.
#

FROM gradle:8.5-jdk17 AS build

WORKDIR /workspace

# 1) 의존성 캐시 최적화:
# - 빌드 스크립트/래퍼를 먼저 복사하면, 소스 변경 시에도 의존성 레이어 캐시가 유지됩니다.
COPY gradlew gradlew.bat build.gradle.kts settings.gradle.kts ./
COPY gradle ./gradle

# Gradle wrapper 실행 권한 보장(일부 환경에서 필요).
RUN chmod +x ./gradlew

# 2) 소스 복사 후 빌드
COPY src ./src

# 테스트는 CI에서 별도로 돌릴 수 있으므로, 컨테이너 빌드에서는 기본적으로 스킵합니다.
# - 필요하면 `--build-arg RUN_TESTS=true` 등으로 확장할 수 있습니다.
RUN ./gradlew clean bootJar -x test

FROM eclipse-temurin:17-jre AS runtime

WORKDIR /app

# 빌드 산출물(bootJar)을 복사합니다.
COPY --from=build /workspace/build/libs/*.jar ./app.jar

# Spring Boot 기본 포트
EXPOSE 8080

# 컨테이너 실행 명령
ENTRYPOINT ["java", "-jar", "/app/app.jar"]

