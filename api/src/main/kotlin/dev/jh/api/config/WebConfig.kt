package dev.jh.api.config

import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

/**
 * Web(MVC) 관련 설정을 모아두는 구성 클래스입니다.
 *
 * 현재 목적:
 * - 로컬 개발 환경에서 `apps/web`(Vite dev server)에서 API를 호출할 수 있도록 CORS를 허용합니다.
 *
 * 주의:
 * - 운영 환경에서는 프론트 도메인만 정확히 허용하도록 제한하는 것이 안전합니다.
 * - 인증/권한이 추가되면(예: OAuth allowlist) `allowCredentials` 등 정책을 재검토해야 합니다.
 */
@Configuration
class WebConfig : WebMvcConfigurer {
	override fun addCorsMappings(registry: CorsRegistry) {
		registry
			.addMapping("/api/**")
			.allowedOrigins("http://localhost:5173")
			.allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
			.allowedHeaders("*")
			.allowCredentials(false)
	}
}

