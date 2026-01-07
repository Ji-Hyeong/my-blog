package dev.jh.api.health

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.Instant

/**
 * 프론트엔드가 “API가 떠 있는지”를 간단히 확인할 수 있는 헬스체크 엔드포인트입니다.
 *
 * - Actuator의 `/actuator/health`도 있지만,
 *   프론트에서 `/api/` 하위 네임스페이스만 사용하도록 통일하기 위해 별도 엔드포인트를 둡니다.
 */
@RestController
@RequestMapping("/api")
class HealthController {
	@GetMapping("/health")
	fun health(): HealthResponse = HealthResponse(
		status = "ok",
		timestamp = Instant.now().toString(),
	)
}

/**
 * 헬스체크 응답 DTO입니다.
 *
 * 향후 확장 예:
 * - 버전(build version) 표기
 * - 의존성(DB 등) 상태 요약
 */
data class HealthResponse(
	val status: String,
	val timestamp: String,
)
