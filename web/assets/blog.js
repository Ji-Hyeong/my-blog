/*
  Blog list renderer.
  Keeps the blog minimal: a few strong posts with high signal.
*/
(() => {
  const blogRoot = document.getElementById('blogList');

  // Guard: only run when the blog list container exists.
  if (!blogRoot) {
    return;
  }

  /**
   * API에서 내려온 posts 데이터를 UI 카드로 렌더링합니다.
   *
   * - 기존 UI 구조/스타일을 유지하기 위해 HTML 구조는 최대한 기존 형태를 보존합니다.
   */
  const renderError = () => {
    blogRoot.innerHTML = `
      <div class="card">
        <h3>데이터 로딩 실패</h3>
        <p>
          API 연결에 실패했습니다.
          <br />
          로컬: <code>apps/api</code>를 실행하고 <code>/api/posts</code>가 응답하는지 확인해 주세요.
        </p>
      </div>
    `;
  };

  const renderPosts = (data) => {
    blogRoot.innerHTML = data.posts
        .map(
          (post) => `
        <article class="post-card">
          <p class="post-meta">${post.category} · ${post.date}</p>
          <h3>${post.title}</h3>
          <p>${post.excerpt}</p>
          <a class="button ghost" href="${post.href}">읽기</a>
        </article>
      `
        )
        .join('');
  };

  /**
   * JSON을 안전하게 fetch합니다.
   *
   * - `fetch()`는 404/500이어도 예외를 던지지 않으므로 상태 코드를 확인합니다.
   * - 실패 시 호출부에서 폴백 전략을 적용할 수 있도록 예외를 던집니다.
   */
  const fetchJsonOrThrow = async (url) => {
    const response = await fetch(url, { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} from ${url}`);
    }
    return response.json();
  };

  /**
   * 데이터 로딩 전략:
   * 1) API(`/api/posts`) 호출을 먼저 시도합니다.
   * 2) 실패하면 GitHub Pages 정적 배포 경로(`/data/posts.json`)로 폴백합니다.
   */
  const loadPostsData = async (apiBaseUrl) => {
    try {
      return await fetchJsonOrThrow(`${apiBaseUrl}/api/posts`);
    } catch (error) {
      return fetchJsonOrThrow('/data/posts.json');
    }
  };

  /**
   * 데이터는 “정적 파일(data/*.json)”이 아니라 백엔드 API에서 받아옵니다.
   * - 배포 환경에서는 HTTPS로 제공되는 API를 호출하게 됩니다.
   */
  const apiBaseUrl = window.JH_BLOG?.getApiBaseUrl?.() || 'http://localhost:8080';

  loadPostsData(apiBaseUrl).then(renderPosts).catch(renderError);
})();
