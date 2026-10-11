// State Management
let currentPosts = [];
let activeCategory = 'All';
let searchQuery = '';
let currentPostInModal = null;

// DOM Elements
const articlesGrid = document.getElementById('articlesGrid');
const postCountBadge = document.getElementById('postCountBadge');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const categoryPills = document.getElementById('categoryPills');
const serverStatusPill = document.getElementById('serverStatusPill');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');

// Modals
const readModal = document.getElementById('readModal');
const editorModal = document.getElementById('editorModal');
const apiModal = document.getElementById('apiModal');
const postForm = document.getElementById('postForm');
const commentForm = document.getElementById('commentForm');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  fetchPosts();
  checkBackendHealth();
  setupEventListeners();
  initTheme();
});

// Event Listeners Setup
function setupEventListeners() {
  // Theme Toggle
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);

  // New Post Button
  document.getElementById('newPostBtn').addEventListener('click', () => openNewPostModal());

  // API Modal Trigger
  document.getElementById('apiModalTrigger').addEventListener('click', () => openApiModal());
  serverStatusPill.addEventListener('click', () => openApiModal());

  // Category Filtering
  categoryPills.addEventListener('click', (e) => {
    if (e.target.classList.contains('pill')) {
      document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      e.target.classList.add('active');
      activeCategory = e.target.dataset.cat;
      fetchPosts();
    }
  });

  // Search Input with Debounce
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim();
    clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      fetchPosts();
    }, 300);
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearSearchBtn.style.display = 'none';
    fetchPosts();
  });

  // Post Form Submit (Create / Edit)
  postForm.addEventListener('submit', handleSavePost);

  // Comment Form Submit
  commentForm.addEventListener('submit', handleAddComment);

  // Modal Like Button
  document.getElementById('modalLikeBtn').addEventListener('click', handleLikePost);

  // Modal Delete Button
  document.getElementById('modalDeleteBtn').addEventListener('click', handleDeletePost);

  // Modal Edit Button
  document.getElementById('modalEditBtn').addEventListener('click', () => {
    if (currentPostInModal) {
      closeReadModal();
      openEditPostModal(currentPostInModal);
    }
  });

  // Close modals on backdrop click
  window.addEventListener('click', (e) => {
    if (e.target === readModal) closeReadModal();
    if (e.target === editorModal) closeEditorModal();
    if (e.target === apiModal) closeApiModal();
  });

  // ESC key to close modal
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeReadModal();
      closeEditorModal();
      closeApiModal();
    }
  });
}

// Check Backend Health & Telemetry
async function checkBackendHealth() {
  try {
    const res = await fetch('/api/status');
    if (!res.ok) throw new Error('API offline');
    const data = await res.json();

    statusDot.className = 'status-indicator live';
    statusText.textContent = data.databaseConnected ? 'MongoDB Connected' : 'Backend Live (In-Memory)';

    // Update Diagnostics Modal
    document.getElementById('diagServer').textContent = data.server || 'Node.js + Express';
    document.getElementById('diagDb').textContent = data.database || 'Active';
    document.getElementById('diagPort').textContent = window.location.port || '5000';
    document.getElementById('diagCount').textContent = data.totalPosts || currentPosts.length;
  } catch (err) {
    statusDot.className = 'status-indicator fallback';
    statusText.textContent = 'Server Offline';
  }
}

// Fetch Posts from Backend REST API
async function fetchPosts() {
  try {
    let url = '/api/posts?';
    if (activeCategory && activeCategory !== 'All') {
      url += `category=${encodeURIComponent(activeCategory)}&`;
    }
    if (searchQuery) {
      url += `search=${encodeURIComponent(searchQuery)}&`;
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch posts');
    const result = await res.json();

    currentPosts = result.data || [];
    renderPosts(currentPosts);
    postCountBadge.textContent = currentPosts.length;
    checkBackendHealth();
  } catch (err) {
    console.error('Fetch error:', err);
    showToast('Failed to load posts from server', 'error');
    renderPosts([]);
  }
}

// Render Blog Cards
function renderPosts(posts) {
  if (!posts || posts.length === 0) {
    articlesGrid.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';
  articlesGrid.innerHTML = posts.map(post => {
    const formattedDate = new Date(post.createdAt || Date.now()).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const tagsHtml = (post.tags || [])
      .map(tag => `<span class="tag-badge">#${escapeHtml(tag)}</span>`)
      .join('');

    const authorInitial = (post.author || 'A').charAt(0).toUpperCase();

    return `
      <article class="article-card" onclick="openReadModal('${post._id}')">
        <div class="card-image-wrap">
          <img 
            src="${post.coverImage || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80'}" 
            alt="${escapeHtml(post.title)}" 
            class="card-image"
            loading="lazy"
            onerror="this.src='https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80'"
          />
          <span class="card-cat-badge">${escapeHtml(post.category || 'Tech')}</span>
        </div>

        <div class="card-body">
          <div class="card-meta">
            <span>${formattedDate}</span>
            <span><i class="fa-regular fa-clock"></i> ${post.readTime || 3} min read</span>
          </div>

          <h2 class="card-title">${escapeHtml(post.title)}</h2>
          <p class="card-snippet">${escapeHtml(post.snippet || '')}</p>

          <div class="card-tags">${tagsHtml}</div>

          <div class="card-footer">
            <div class="author-chip">
              <div class="mini-avatar">${authorInitial}</div>
              <span>${escapeHtml(post.author || 'Admin')}</span>
            </div>
            <div class="card-stats">
              <span class="card-stat-item"><i class="fa-regular fa-heart"></i> ${post.likes || 0}</span>
              <span class="card-stat-item"><i class="fa-regular fa-comment"></i> ${(post.comments || []).length}</span>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// Open Post Reader Modal
async function openReadModal(postId) {
  try {
    const res = await fetch(`/api/posts/${postId}`);
    if (!res.ok) throw new Error('Post not found');
    const result = await res.json();
    const post = result.data;
    currentPostInModal = post;

    document.getElementById('modalPostCategory').textContent = post.category || 'Technology';
    document.getElementById('modalPostImage').src = post.coverImage || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80';
    document.getElementById('modalPostTitle').textContent = post.title;
    document.getElementById('modalPostAuthor').textContent = post.author || 'Admin';
    document.getElementById('modalAuthorInitial').textContent = (post.author || 'A').charAt(0).toUpperCase();
    document.getElementById('modalPostDate').textContent = new Date(post.createdAt).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    document.getElementById('modalPostReadTime').textContent = `${post.readTime || 4} min read`;
    document.getElementById('modalLikeCount').textContent = post.likes || 0;

    // Tags
    const tagsContainer = document.getElementById('modalPostTags');
    tagsContainer.innerHTML = (post.tags || []).map(t => `<span class="tag-badge">#${escapeHtml(t)}</span>`).join('');

    // Format content with paragraphs / basic markdown
    document.getElementById('modalPostContent').innerHTML = formatContent(post.content);

    // Comments
    renderComments(post.comments || []);

    readModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  } catch (err) {
    showToast('Failed to load article details', 'error');
  }
}

function closeReadModal() {
  readModal.classList.remove('open');
  document.body.style.overflow = '';
  currentPostInModal = null;
}

// Render Comments List
function renderComments(comments) {
  document.getElementById('modalCommentCount').textContent = comments.length;
  const list = document.getElementById('modalCommentsList');

  if (comments.length === 0) {
    list.innerHTML = `<p style="color: var(--text-faint); font-size: 0.9rem;">No comments yet. Be the first to share your thoughts!</p>`;
    return;
  }

  list.innerHTML = comments.map(c => {
    const dateStr = new Date(c.createdAt || Date.now()).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    return `
      <div class="comment-bubble">
        <div class="comment-header">
          <strong>${escapeHtml(c.author)}</strong>
          <span>${dateStr}</span>
        </div>
        <p class="comment-text">${escapeHtml(c.text)}</p>
      </div>
    `;
  }).join('');
}

// Add Comment Handler
async function handleAddComment(e) {
  e.preventDefault();
  if (!currentPostInModal) return;

  const author = document.getElementById('commentAuthor').value.trim();
  const text = document.getElementById('commentText').value.trim();

  if (!author || !text) return;

  try {
    const res = await fetch(`/api/posts/${currentPostInModal._id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author, text })
    });

    if (!res.ok) throw new Error('Comment failed');
    const result = await res.json();

    currentPostInModal.comments = result.data;
    renderComments(result.data);
    document.getElementById('commentText').value = '';
    showToast('Comment posted successfully!', 'success');
    fetchPosts(); // Refresh counters on background grid
  } catch (err) {
    showToast('Could not post comment', 'error');
  }
}

// Like Post Handler
async function handleLikePost() {
  if (!currentPostInModal) return;

  try {
    const res = await fetch(`/api/posts/${currentPostInModal._id}/like`, { method: 'POST' });
    if (!res.ok) throw new Error('Like failed');
    const data = await res.json();

    currentPostInModal.likes = data.likes;
    document.getElementById('modalLikeCount').textContent = data.likes;
    showToast('Article liked! ❤️', 'success');
    fetchPosts();
  } catch (err) {
    showToast('Failed to like post', 'error');
  }
}

// Delete Post Handler
async function handleDeletePost() {
  if (!currentPostInModal) return;
  if (!confirm('Are you sure you want to delete this article?')) return;

  try {
    const res = await fetch(`/api/posts/${currentPostInModal._id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed');

    showToast('Article deleted successfully', 'success');
    closeReadModal();
    fetchPosts();
  } catch (err) {
    showToast('Failed to delete post', 'error');
  }
}

// Open Editor Modal (Create)
function openNewPostModal() {
  document.getElementById('editorModalTitle').innerHTML = '<i class="fa-solid fa-feather"></i> Write New Article';
  document.getElementById('postIdInput').value = '';
  postForm.reset();
  editorModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

// Open Editor Modal (Edit)
function openEditPostModal(post) {
  document.getElementById('editorModalTitle').innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Edit Article';
  document.getElementById('postIdInput').value = post._id;
  document.getElementById('postTitle').value = post.title;
  document.getElementById('postCategory').value = post.category || 'Technology';
  document.getElementById('postAuthor').value = post.author || 'Admin';
  document.getElementById('postTags').value = (post.tags || []).join(', ');
  document.getElementById('postCoverImage').value = post.coverImage || '';
  document.getElementById('postSnippet').value = post.snippet || '';
  document.getElementById('postContent').value = post.content || '';
  document.getElementById('postReadTime').value = post.readTime || 4;

  editorModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeEditorModal() {
  editorModal.classList.remove('open');
  document.body.style.overflow = '';
}

// Save Post (POST or PUT)
async function handleSavePost(e) {
  e.preventDefault();

  const id = document.getElementById('postIdInput').value;
  const isEdit = !!id;

  const postPayload = {
    title: document.getElementById('postTitle').value.trim(),
    category: document.getElementById('postCategory').value,
    author: document.getElementById('postAuthor').value.trim(),
    tags: document.getElementById('postTags').value.split(',').map(t => t.trim()).filter(Boolean),
    coverImage: document.getElementById('postCoverImage').value.trim(),
    snippet: document.getElementById('postSnippet').value.trim(),
    content: document.getElementById('postContent').value.trim(),
    readTime: Number(document.getElementById('postReadTime').value) || 3
  };

  try {
    const url = isEdit ? `/api/posts/${id}` : '/api/posts';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postPayload)
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || 'Save failed');
    }

    showToast(isEdit ? 'Article updated successfully!' : 'Article published to backend!', 'success');
    closeEditorModal();
    fetchPosts();
  } catch (err) {
    showToast(err.message || 'Failed to save article', 'error');
  }
}

// API Inspector Modal
function openApiModal() {
  checkBackendHealth();
  apiModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeApiModal() {
  apiModal.classList.remove('open');
  document.body.style.overflow = '';
}

// Helper: Toast Notifications
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-circle-info'}"></i>
    <span>${escapeHtml(message)}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Helper: Simple Markdown Formatter
function formatContent(text) {
  if (!text) return '';
  return text
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/`(.*?)`/gim, '<code style="background: rgba(255,255,255,0.1); padding: 0.15rem 0.4rem; border-radius: 4px; font-family: monospace;">$1</code>');
}

// Helper: HTML Escaping
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Theme handling
function initTheme() {
  const savedTheme = localStorage.getItem('devsphere_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('devsphere_theme', next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('themeIcon');
  if (theme === 'dark') {
    icon.className = 'fa-solid fa-moon';
  } else {
    icon.className = 'fa-solid fa-sun';
  }
}
