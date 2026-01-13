/*
  Blog list renderer.
  Keeps the blog minimal: a few strong posts with high signal.
*/
(() => {
  const blogRoot = document.getElementById('blogList');
  const writerControls = document.getElementById('writerControls');

  // Guard: only run when the blog list container exists.
  if (!blogRoot) {
    return;
  }

  /**
   * posts 데이터를 UI 카드로 렌더링합니다.
   *
   * - 기존 UI 구조/스타일을 유지하기 위해 HTML 구조는 최대한 기존 형태를 보존합니다.
   */
  const renderError = (message) => {
    blogRoot.innerHTML = `
      <div class="card">
        <h3>데이터 로딩 실패</h3>
        <p>
          ${message || '글 데이터를 불러오지 못했습니다.'}
        </p>
        <p class="home-muted" style="margin-top: 10px; line-height: 1.7;">
          체크 포인트:
          <br />- Supabase에 <code>posts</code> 테이블/RLS 정책이 적용되어 있는지
          <br />- 공개 방문자는 <code>published=true</code> 글만 읽을 수 있는지
          <br />- 로컬에서 Supabase 없이 확인하려면 <code>/data/posts.json</code>이 존재하는지
        </p>
      </div>
    `;
  };

  /**
   * API 기본 URL을 계산합니다.
   *
   * - meta(name="api-base-url")가 있으면 해당 값을 사용합니다.
   * - 로컬 환경(localhost)에서는 기본값(8080)을 사용합니다.
   * - 배포 환경에서는 현재 오리진을 사용합니다.
   */
  const getApiBaseUrl = () => {
    const meta = document.querySelector('meta[name="api-base-url"]');
    const override = meta?.getAttribute('content')?.trim();
    if (override) {
      return override.replace(/\/$/, '');
    }

    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    if (isLocalhost) {
      return 'http://localhost:8080';
    }

    return window.location.origin;
  };

  /**
   * UI 카드 렌더링.
   *
   * - Supabase 기반에서는 slug로 상세 페이지(#/post/:slug)로 이동합니다.
   * - 과거/폴백 데이터(정적 posts.json)는 기존 href를 그대로 사용할 수 있습니다.
   */
  const renderPostCards = ({ posts, isWriter }) => {
    blogRoot.innerHTML = posts
        .map(
          (post) => `
        <article class="post-card">
          <p class="post-meta">${post.category} · ${post.date}</p>
          <h3>${post.title}</h3>
          <p>${post.excerpt}</p>
          <div class="hero-actions" style="margin-top: 10px;">
            <a class="button ghost" href="${post.href}">읽기</a>
            ${
              isWriter
                ? `<button class="button ghost" data-action="edit" data-slug="${post.slug || ''}">수정</button>
                   <button class="button ghost" data-action="delete" data-id="${post.id || ''}">삭제</button>`
                : ''
            }
          </div>
        </article>
      `
        )
        .join('');
  };

  /**
   * JSON을 안전하게 fetch합니다(폴백 데이터 용).
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
   * 1) Supabase(posts 테이블)에서 목록을 조회합니다.
   * 2) Supabase가 없거나 실패하면 정적(`/data/posts.json`) → API(`/api/posts`)로 폴백합니다.
   */
  const loadPosts = async () => {
    let supabaseFailure = null;
    /**
     * 1) Supabase 우선
     *
     * - public: published=true만 노출
     * - writer: 전체(초안 포함) 노출 + CRUD UI 활성화
     */
    try {
      const client = await window.JH_SUPABASE.getSupabaseClient();
      const session = await window.JH_SUPABASE.getSession();
      const isWriter = window.JH_SUPABASE.isWriter(session);

      if (writerControls) {
        writerControls.style.display = isWriter ? 'block' : 'none';
      }

      const base = client
        .from('posts')
        .select(
          'id, slug, title, excerpt, category, content, published, published_at, created_at'
        )
        .order('published_at', { ascending: false })
        .order('created_at', { ascending: false });

      const query = isWriter ? base : base.eq('published', true);
      const { data, error } = await query;
      if (error) {
        throw error;
      }

      const posts = (data || []).map((row) => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        excerpt: row.excerpt,
        category: row.category,
        date: row.published_at ? String(row.published_at).slice(0, 10) : '',
        href: row.slug ? `#/post/${encodeURIComponent(row.slug)}` : '#',
      }));

      return { source: 'supabase', posts, isWriter };
    } catch (error) {
      supabaseFailure = error;
      // writerControls는 Supabase 기반일 때만 의미가 있으므로, 폴백에서는 숨깁니다.
      if (writerControls) {
        writerControls.style.display = 'none';
      }
    }

    /**
     * 2) 정적 → API 폴백
     */
    const apiBaseUrl = getApiBaseUrl();
    try {
      const data = await fetchJsonOrThrow('/data/posts.json');
      const posts = (data.posts || []).map((post) => ({ ...post }));
      return { source: 'legacy', posts, isWriter: false };
    } catch (error) {
      try {
        const data = await fetchJsonOrThrow(`${apiBaseUrl}/api/posts`);
        const posts = (data.posts || []).map((post) => ({ ...post }));
        return { source: 'legacy', posts, isWriter: false };
      } catch (apiError) {
        const hint = supabaseFailure
          ? `Supabase 오류로 폴백했지만 정적/로컬 API도 실패했습니다.`
          : `정적/로컬 API에서 글 데이터를 찾지 못했습니다.`
        throw new Error(hint)
      }
    }
  };

  /**
   * Writer-only CRUD 바인딩.
   *
   * - Supabase source일 때만 활성화됩니다.
   */
  const bindWriterCrud = async () => {
    if (!writerControls) {
      return;
    }

    const form = document.getElementById('postForm');
    const status = document.getElementById('postStatus');
    const reset = document.getElementById('postReset');

    const slugInput = document.getElementById('postSlug');
    const titleInput = document.getElementById('postTitle');
    const categoryInput = document.getElementById('postCategory');
    const dateInput = document.getElementById('postDate');
    const excerptInput = document.getElementById('postExcerpt');
    const contentInput = document.getElementById('postContent');
    const publishedInput = document.getElementById('postPublished');

    if (!form || !status || !reset) {
      return;
    }

    const setStatus = (text) => {
      status.textContent = text;
    };

    const clearForm = () => {
      slugInput.value = '';
      titleInput.value = '';
      categoryInput.value = '';
      dateInput.value = '';
      excerptInput.value = '';
      contentInput.value = '';
      publishedInput.checked = false;
      setStatus('');
    };

    reset.addEventListener('click', clearForm);

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      setStatus('저장 중…');

      try {
        const session = await window.JH_SUPABASE.getSession();
        if (!window.JH_SUPABASE.isWriter(session)) {
          setStatus('작성 권한이 없습니다.');
          return;
        }

        const slug = slugInput.value.trim();
        const title = titleInput.value.trim();
        const category = categoryInput.value.trim();
        const excerpt = excerptInput.value.trim();
        const content = contentInput.value.trim();
        const published = Boolean(publishedInput.checked);
        const publishedAt = published && dateInput.value ? dateInput.value : null;

        if (!slug || !title) {
          setStatus('slug와 title은 필수입니다.');
          return;
        }

        const client = await window.JH_SUPABASE.getSupabaseClient();
        const { error } = await client.from('posts').upsert(
          {
            slug,
            title,
            category,
            excerpt,
            content,
            published,
            published_at: publishedAt,
          },
          { onConflict: 'slug' }
        );

        if (error) {
          throw error;
        }

        setStatus('저장 완료');
        clearForm();
        boot(); // 목록 갱신
      } catch (error) {
        setStatus('저장 실패: 콘솔을 확인해 주세요.');
      }
    });

    /**
     * 카드 버튼(수정/삭제) 이벤트는 컨테이너 위임으로 처리합니다.
     */
    blogRoot.addEventListener('click', async (event) => {
      const button = event.target.closest('button[data-action]');
      if (!button) {
        return;
      }

      const action = button.getAttribute('data-action');
      if (action === 'edit') {
        const slug = button.getAttribute('data-slug') || '';
        if (!slug) {
          return;
        }

        try {
          const client = await window.JH_SUPABASE.getSupabaseClient();
          const { data, error } = await client
            .from('posts')
            .select('slug, title, category, excerpt, content, published, published_at')
            .eq('slug', slug)
            .maybeSingle();

          if (error || !data) {
            setStatus('글을 불러오지 못했습니다.');
            return;
          }

          slugInput.value = data.slug || '';
          titleInput.value = data.title || '';
          categoryInput.value = data.category || '';
          excerptInput.value = data.excerpt || '';
          contentInput.value = data.content || '';
          publishedInput.checked = Boolean(data.published);
          dateInput.value = data.published_at ? String(data.published_at).slice(0, 10) : '';
          setStatus('수정 모드: 저장하면 업데이트됩니다.');
          writerControls.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (error) {
          setStatus('글을 불러오지 못했습니다.');
        }
        return;
      }

      if (action === 'delete') {
        const id = button.getAttribute('data-id') || '';
        if (!id) {
          return;
        }
        if (!confirm('정말 삭제할까요?')) {
          return;
        }

        try {
          const session = await window.JH_SUPABASE.getSession();
          if (!window.JH_SUPABASE.isWriter(session)) {
            setStatus('작성 권한이 없습니다.');
            return;
          }

          const client = await window.JH_SUPABASE.getSupabaseClient();
          const { error } = await client.from('posts').delete().eq('id', id);
          if (error) {
            throw error;
          }
          setStatus('삭제 완료');
          boot();
        } catch (error) {
          setStatus('삭제 실패: 콘솔을 확인해 주세요.');
        }
      }
    });
  };

  /**
   * 페이지 부트스트랩.
   *
   * - supabase 성공: CRUD 활성화 + supabase posts 표시
   * - 폴백: 기존 posts.json 기반으로 표시
   */
  const boot = async () => {
    try {
      const { source, posts, isWriter } = await loadPosts();
      renderPostCards({ posts, isWriter: source === 'supabase' && isWriter });
      if (source === 'supabase' && isWriter) {
        await bindWriterCrud();
      }
    } catch (error) {
      renderError(error?.message);
    }
  };

  boot();
})();
