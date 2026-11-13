// 🚀 调试日志函数
function log(msg) {
    const debugContent = document.getElementById('debugContent');
    const time = new Date().toLocaleTimeString();
    debugContent.innerHTML += `<br><span style="color:#aaa;">[${time}]</span> ${msg}`;
    const box = document.getElementById('debugBox');
    box.scrollTop = box.scrollHeight;
}

document.addEventListener('DOMContentLoaded', () => {
    log("页面加载完成，JS 已启动");

    // 1. 下拉框逻辑
    const searchTypeBtn = document.getElementById('searchTypeBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const searchTypeText = document.getElementById('searchTypeText');
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    let currentSearchType = 'current';

    searchTypeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
        if (!searchTypeBtn.contains(e.target)) {
            dropdownMenu.classList.remove('show');
        }
    });

    dropdownItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            currentSearchType = e.target.dataset.type;
            searchTypeText.textContent = e.target.textContent;
            dropdownItems.forEach(i => i.classList.remove('active'));
            e.target.classList.add('active');
            dropdownMenu.classList.remove('show');
            log(`切换搜索模式: ${e.target.textContent}`);
        });
    });

    // ============ 小眼睛密码切换逻辑 ============
    const pwdInput = document.getElementById('pwdInput');
    const togglePwd = document.getElementById('togglePwd');
    if(togglePwd) {
        togglePwd.addEventListener('click', () => {
            if (pwdInput.type === 'password') {
                pwdInput.type = 'text';
                togglePwd.textContent = '🙈';
            } else {
                pwdInput.type = 'password';
                togglePwd.textContent = '👁';
            }
        });
    }

    // 2. 搜索按钮逻辑
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    const viewHome = document.getElementById('viewHome');
    const viewAllSearch = document.getElementById('viewAllSearch');
    const categoryNav = document.getElementById('categoryNav');

    searchBtn.addEventListener('click', async () => {
        const kw = searchInput.value.trim();
        if (!kw) {
            log("搜索词为空，停止搜索");
            return;
        }
        
        log(`开始真实搜索: ${kw}`);
        categoryNav.style.display = 'none'; 
        
        const apiUrl = "https://360zy.com/api.php/provide/vod/";
        
        if (currentSearchType === 'current') {
            viewHome.style.display = 'block'; 
            viewAllSearch.style.display = 'none';
            
            try {
                const fetchUrl = `http://soys.whf.bz/api/search.php?kw=${encodeURIComponent(kw)}&api=${encodeURIComponent(apiUrl)}`;
                log(`准备请求: ${fetchUrl}`);
                const res = await fetch(fetchUrl);
                const json = await res.json();
                
                if (json.code === 0) {
                    log(`成功拿到 ${json.data.length} 条数据`);
                    renderRealPosters(json.data);
                } else {
                    log(`搜索失败: ${json.msg}`);
                    showToast(json.msg);
                }
            } catch(e) {
                log(`网络请求出错: ${e.message}`);
            }
        } else {
            showToast('全站搜索逻辑待开发');
        }
    });

    // 渲染真实的电影海报并绑定跳转播放
    function renderRealPosters(dataList) {
        const homeGrid = document.querySelector('#viewHome .poster-grid');
        homeGrid.innerHTML = ''; 
        
        dataList.slice(0, 12).forEach(movie => {
            const name = movie.vod_name || '未知';
            const pic = movie.vod_pic || 'https://via.placeholder.com/300x400/e0c3a6/fff?text=No+Image';
            const remarks = movie.vod_remarks || '';
            
            const card = document.createElement('div');
            card.className = 'poster-card';
            
            // 点击卡片直接打开播放器
            card.onclick = () => openPlayerModal(movie);
            
            card.innerHTML = `
                <div class="poster-img-wrap">
                    <img src="${pic}" alt="${name}" referrerpolicy="no-referrer" onerror="this.src='https://via.placeholder.com/300x400/e0c3a6/fff?text=Error'">
                    ${remarks ? `<span class="poster-tag">${remarks}</span>` : ''}
                </div>
                <div class="poster-name">${name}</div>
            `;
            homeGrid.appendChild(card);
        });
    }

    // ============ 播放器核心逻辑 ============
    let dp = null; // 全局播放器实例

    window.openPlayerModal = function(movie) {
        log(`打开播放器: ${movie.vod_name}`);
        document.getElementById('playerModal').classList.add('show');
        document.getElementById('playTitle').textContent = movie.vod_name;
        
        // 去除简介里的 HTML 标签
        const desc = movie.vod_content ? movie.vod_content.replace(/<[^>]+>/g, '') : '暂无简介';
        document.getElementById('playDesc').textContent = desc;

        const epContainer = document.getElementById('playEpisodes');
        epContainer.innerHTML = '';

        // 解析剧集 (苹果CMS格式: 第01集$链接#第02集$链接)
        const playUrls = movie.vod_play_url ? movie.vod_play_url.split('#') : [];
        
        if (playUrls.length === 0 || !playUrls[0]) {
            epContainer.innerHTML = '<span style="color:#fff">暂无可用播放源</span>';
            return;
        }

        playUrls.forEach((ep, index) => {
            const epInfo = ep.split('$'); 
            if (epInfo.length < 2) return;

            const epName = epInfo[0];
            const epUrl = epInfo[1];

            const btn = document.createElement('div');
            btn.style.cssText = "text-align:center; padding: 8px; background: #222; color: #ccc; border-radius: 6px; font-size: 13px; cursor: pointer; overflow:hidden; white-space:nowrap; text-overflow:ellipsis;";
            btn.textContent = epName;
            btn.onclick = () => playVideo(epUrl, epName);
            epContainer.appendChild(btn);
            
            // 默认自动播放第一集
            if (index === 0) {
                setTimeout(() => playVideo(epUrl, epName), 100);
            }
        });
    };

    window.playVideo = function(url, title) {
        log(`开始播放: ${title}`);
        document.getElementById('playTitle').textContent = title;

        if (dp) {
            dp.destroy(); // 销毁旧实例
        }

        // 初始化 DPlayer
        dp = new DPlayer({
            container: document.getElementById('dplayer'),
            autoplay: true,
            theme: '#d97736',
            video: {
                url: url,
                type: 'auto' // 自动识别 m3u8
            }
        });
    };

    window.closePlayerModal = function() {
        document.getElementById('playerModal').classList.remove('show');
        if (dp) {
            dp.pause();
        }
    };

    // 3. 管理员交互逻辑
    const adminModal = document.getElementById('adminModal');
    const modalTitle = document.getElementById('modalTitle');
    const loginView = document.getElementById('loginView');
    const addView = document.getElementById('addView');
    const guestBtn = document.getElementById('guestBtn');
    
    window.isAdmin = false;

    window.openAdminModal = function() {
        adminModal.classList.add('show');
        if (isAdmin) {
            modalTitle.textContent = '添加新搜索源';
            loginView.style.display = 'none';
            addView.style.display = 'block';
            log("管理员直接进入添加源页面");
        } else {
            modalTitle.textContent = '管理员登录';
            loginView.style.display = 'block';
            addView.style.display = 'none';
            log("打开管理员登录弹窗");
        }
    };

    window.closeAdminModal = function() {
        adminModal.classList.remove('show');
        document.getElementById('pwdInput').value = '';
        log("关闭管理员弹窗");
    };

    window.checkLogin = function() {
        const pwd = document.getElementById('pwdInput').value;
        if (pwd === '123456') {
            isAdmin = true;
            modalTitle.textContent = '添加新搜索源';
            loginView.style.display = 'none';
            addView.style.display = 'block';
            guestBtn.style.display = 'block';
            document.getElementById('pwdInput').value = '';
            log("密码正确，切换至添加源视图");
            renderCards(); 
        } else {
            log("密码错误");
            showToast('密码错误，请重试');
        }
    };

    window.logoutAdmin = function() {
        isAdmin = false;
        adminModal.classList.remove('show');
        guestBtn.style.display = 'none';
        log("退出管理员，切换回游客模式");
        renderCards();
    };

    // ============ 源卡片点击与操作按钮逻辑 ============
    window.selectSource = function(el) {
        document.querySelectorAll('.source-card').forEach(c => c.classList.remove('active'));
        el.classList.add('active');
        
        document.querySelectorAll('.card-ops').forEach(ops => ops.classList.remove('show'));

        if (isAdmin) {
            const ops = el.querySelector('.card-ops');
            if (ops) {
                ops.classList.add('show');
            }
        } else {
            log(`游客选中了源: ${el.textContent}`);
        }
    };

    window.renderCards = function() {
        const sourceCards = document.querySelectorAll('.source-card:not(.add-btn)');
        sourceCards.forEach((card, index) => {
            const oldOps = card.querySelector('.card-ops');
            if (oldOps) oldOps.remove();
            card.classList.remove('active-admin');

            if (isAdmin) {
                card.classList.add('active-admin');
                const opsHtml = `
                    <div class="card-ops">
                        <button class="opt-btn edit" onclick="handleEdit(event, ${index})">✎</button>
                        <button class="opt-btn del" onclick="handleDelete(event, ${index})">✕</button>
                    </div>
                `;
                card.insertAdjacentHTML('beforeend', opsHtml);
            }
        });
    };

    // ============ 自定义编辑弹窗逻辑 ============
    window.handleEdit = function(e, index) {
        if(e) e.stopPropagation(); 
        log(`打开编辑弹窗: 第 ${index} 个源`);
        
        const cardEl = document.querySelectorAll('.source-card:not(.add-btn)')[index];
        let oldName = "";
        cardEl.childNodes.forEach(node => {
            if(node.nodeType === 3 && node.textContent.trim()) oldName += node.textContent.trim();
        });
        if(!oldName) oldName = "未知源";
        
        document.getElementById('editIndex').value = index;
        document.getElementById('editName').value = oldName;
        document.getElementById('editApi').value = "https://tyyszyapi.com/api.php/provide/vod/"; 
        
        document.getElementById('editModal').classList.add('show');
    };

    window.closeEditModal = function() {
        document.getElementById('editModal').classList.remove('show');
    };

    window.saveEdit = function() {
        const idx = document.getElementById('editIndex').value;
        const newName = document.getElementById('editName').value.trim();
        if(!newName) return showToast('源名称不能为空');
        
        log(`保存修改：索引 ${idx} 名称改为 ${newName}`);
        closeEditModal();
        showToast('修改成功（前端模拟）');
    };

    // ============ 自定义删除弹窗逻辑 ============
    window.handleDelete = function(e, index) {
        if(e) e.stopPropagation();
        log(`打开删除确认弹窗: 第 ${index} 个源`);
        document.getElementById('deleteIndex').value = index;
        document.getElementById('deleteModal').classList.add('show');
    };

    window.closeDeleteModal = function() {
        document.getElementById('deleteModal').classList.remove('show');
    };

    window.confirmDelete = function() {
        const idx = document.getElementById('deleteIndex').value;
        log(`确认删除：索引 ${idx}`);
        closeDeleteModal();
        showToast('删除成功（前端模拟）');
    };

    // 点击空白处收起按钮
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.source-card')) {
            document.querySelectorAll('.card-ops').forEach(ops => ops.classList.remove('show'));
        }
    });

    // ============ 提示框与校验逻辑 ============
    window.showToast = function(msg) {
        const toast = document.getElementById('toastMsg');
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    };

    window.submitAddSource = function() {
        const nameInput = document.getElementById('addName').value.trim();
        const apiInput = document.getElementById('addApi').value.trim();

        if (!nameInput) return showToast('源名称不能为空');
        if (!apiInput) return showToast('API 接口地址不能为空');
        if (!apiInput.startsWith('http://') && !apiInput.startsWith('https://')) return showToast('接口地址必须以 http 或 https 开头');

        const existingCards = document.querySelectorAll('.source-card:not(.add-btn)');
        let isRepeat = false;
        existingCards.forEach(card => {
            let cardText = "";
            card.childNodes.forEach(node => {
                if(node.nodeType === 3 && node.textContent.trim()) cardText += node.textContent.trim();
            });
            if (cardText === nameInput) isRepeat = true;
        });

        if (isRepeat) return showToast('该源名称已存在，请勿重复添加');

        showToast('添加成功！');
        log(`前端模拟：添加了新源 [${nameInput}]`);
        
        document.getElementById('addName').value = '';
        document.getElementById('addApi').value = '';
        closeAdminModal();
    };
});