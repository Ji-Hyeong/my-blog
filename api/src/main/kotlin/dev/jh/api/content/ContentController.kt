package dev.jh.api.content

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

/**
 * 프론트엔드(기존 정적 UI)가 HTTPS로 받아올 “변경 가능한 데이터”를 제공하는 API입니다.
 *
 * 현재는 파일 기반(JSON)으로 시작합니다.
 * - 이유: 개인 블로그 초기 단계에서는 DB/인증/관리 UI보다 “콘텐츠를 빠르게 수정하고 반영”하는 것이 중요합니다.
 * - 이후: 문서 CRUD + 권한(allowlist/OAuth) + DB(Postgres/pgvector)로 확장할 수 있습니다.
 *
 * 구현 메모:
 * - classpath 리소스(`src/main/resources/data/*.json`)를 매 요청마다 읽습니다.
 * - 장점: 개발 중 파일 변경 → 서버 재시작 시 즉시 반영(또는 devtools 사용 시 더 편함)
 * - 단점: 트래픽이 크면 비효율적이므로, 운영에서는 캐시/DB 전환을 고려합니다.
 */
@RestController
@RequestMapping("/api")
class ContentController(
	private val objectMapper: ObjectMapper,
) {
	/**
	 * 이력/프로필 데이터입니다.
	 *
	 * 프론트(Resume/Builder)가 공통으로 사용합니다.
	 */
	@GetMapping("/profile", produces = [MediaType.APPLICATION_JSON_VALUE])
	fun profile(): JsonNode = readClasspathJson("data/profile.json")

	/**
	 * 맞춤 이력서 조합 화면에서 사용하는 “지원 회사 템플릿” 목록입니다.
	 */
	@GetMapping("/targets", produces = [MediaType.APPLICATION_JSON_VALUE])
	fun targets(): JsonNode = readClasspathJson("data/targets.json")

	/**
	 * 블로그 목록(카드)을 렌더링하기 위한 글 메타데이터 목록입니다.
	 */
	@GetMapping("/posts", produces = [MediaType.APPLICATION_JSON_VALUE])
	fun posts(): JsonNode = readClasspathJson("data/posts.json")

	/**
	 * classpath JSON 파일을 읽어 JsonNode로 반환합니다.
	 *
	 * - 파일이 없으면 예외가 발생하며(500), 이 경우 배포/패키징 구성 문제일 가능성이 큽니다.
	 * - “개발 단계에서 빨리 실패”하는 것이 유지보수에 유리하므로 예외를 숨기지 않습니다.
	 */
	private fun readClasspathJson(path: String): JsonNode {
		val resource = requireNotNull(javaClass.classLoader.getResourceAsStream(path)) {
			"Classpath resource not found: $path"
		}
		return resource.use { objectMapper.readTree(it) }
	}
}

