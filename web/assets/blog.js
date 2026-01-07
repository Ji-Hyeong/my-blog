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
   * 데이터는 “정적 파일(data/*.json)”이 아니라 백엔드 API에서 받아옵니다.
   * - 배포 환경에서는 HTTPS로 제공되는 API를 호출하게 됩니다.
   */
  const apiBaseUrl = window.JH_BLOG?.getApiBaseUrl?.() || 'http://localhost:8080';

  fetch(`${apiBaseUrl}/api/posts`)
    .then((response) => response.json())
    .then(renderPosts)
    .catch(renderError);
})();
