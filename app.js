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

    searchBtn.addEventListener('click', () => {
        const kw = searchInput.value.trim();
        if (!kw) {
            log("搜索词为空，停止搜索");
            return;
        }
        
        log(`开始搜索: ${kw}，模式: ${currentSearchType}`);
        categoryNav.style.display = 'none'; 
        
        if (currentSearchType === 'all') {
            viewHome.style.display = 'none';
            viewAllSearch.style.display = 'block';
            document.querySelector('.search-title').textContent = `搜索结果：${kw}`;
            log("展示全站搜索结果视图");
        } else {
            viewHome.style.display = 'block';
            viewAllSearch.style.display = 'none';
            log("展示当前资源搜索结果视图");
        }
    });

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
        // 提取卡片纯文本
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