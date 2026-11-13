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

// 1. 下拉框逻辑（增加高亮状态与点击收起）
const searchTypeBtn = document.getElementById('searchTypeBtn');
const dropdownMenu = document.getElementById('dropdownMenu');
const searchTypeText = document.getElementById('searchTypeText');
const dropdownItems = document.querySelectorAll('.dropdown-item');
let currentSearchType = 'current';

// 打开/关闭下拉
searchTypeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle('show');
});

// 点击页面任何其他地方，自动收起菜单
document.addEventListener('click', (e) => {
    if (!searchTypeBtn.contains(e.target)) {
        dropdownMenu.classList.remove('show');
    }
});

// 点击选项
dropdownItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.stopPropagation(); // 阻止冒泡，防止触发外层的关闭逻辑
        
        currentSearchType = e.target.dataset.type;
        searchTypeText.textContent = e.target.textContent;
        
        // 移除所有高亮，给当前点击的加上高亮
        dropdownItems.forEach(i => i.classList.remove('active'));
        e.target.classList.add('active');
        
        // 自动收起菜单
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
    
    // 全局管理员状态
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
            isAdmin = true; // 记录状态
            modalTitle.textContent = '添加新搜索源';
            loginView.style.display = 'none';
            addView.style.display = 'block';
            guestBtn.style.display = 'block';
            document.getElementById('pwdInput').value = '';
            log("密码正确，切换至添加源视图");
            
            // 重新渲染卡片，让编辑删除按钮生效
            renderCards(); 
        } else {
            log("密码错误");
            alert('密码错误！');
        }
    };

    window.logoutAdmin = function() {
        isAdmin = false;
        adminModal.classList.remove('show');
        guestBtn.style.display = 'none';
        log("退出管理员，切换回游客模式");
        // 重新渲染卡片，隐藏所有编辑按钮
        renderCards();
    };

    // ============ 源卡片点击与编辑删除逻辑 ============
    // 重写选择源函数（因为要处理管理员状态）
    window.selectSource = function(el) {
        // 如果是管理员，点击卡片显示/隐藏操作按钮，但依然选中
        document.querySelectorAll('.source-card').forEach(c => c.classList.remove('active'));
        el.classList.add('active');
        
        // 隐藏所有卡片的按钮
        document.querySelectorAll('.card-ops').forEach(ops => ops.classList.remove('show'));

        if (isAdmin) {
            // 如果是管理员，直接显示这个卡片的编辑按钮（挂载在节点上）
            const ops = el.querySelector('.card-ops');
            if (ops) {
                ops.classList.add('show');
            }
        } else {
            log(`游客选中了源: ${el.textContent}`);
        }
    };

    // 模拟：添加/渲染卡片时，根据是否管理员生成对应的按钮
    window.renderCards = function() {
        const sourceCards = document.querySelectorAll('.source-card:not(.add-btn)');
        sourceCards.forEach((card, index) => {
            // 先清理旧的按钮
            const oldOps = card.querySelector('.card-ops');
            if (oldOps) oldOps.remove();
            card.classList.remove('active-admin');

            if (isAdmin) {
                card.classList.add('active-admin');
                // 动态插入操作按钮
                const opsHtml = `
                    <div class="card-ops">
                        <button class="opt-btn edit" onclick="log('点击编辑源: ${index}')">✎</button>
                        <button class="opt-btn del" onclick="log('点击删除源: ${index}')">✕</button>
                    </div>
                `;
                card.insertAdjacentHTML('beforeend', opsHtml);
            }
        });
    };

    // 全局点击空白处，收起编辑删除按钮
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.source-card')) {
            document.querySelectorAll('.card-ops').forEach(ops => ops.classList.remove('show'));
        }
    });

});