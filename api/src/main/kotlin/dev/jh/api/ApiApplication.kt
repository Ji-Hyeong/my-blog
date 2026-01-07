package dev.jh.api

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

/**
 * API 애플리케이션 엔트리 포인트입니다.
 *
 * 이 프로젝트는 개인 블로그를 위한 백엔드 API로 확장할 예정이며,
 * 초기 단계에서는 “동적 데이터 갱신(프론트에서 API 호출)”을 위한 최소 REST API부터 시작합니다.
 *
 * 실행:
 * - `./gradlew bootRun`
 */
@SpringBootApplication
class ApiApplication

fun main(args: Array<String>) {
	runApplication<ApiApplication>(*args)
}
