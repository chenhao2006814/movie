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
    let currentSearchType = 'current';

    searchTypeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
    });

    document.addEventListener('click', () => {
        dropdownMenu.classList.remove('show');
    });

    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
            currentSearchType = e.target.dataset.type;
            searchTypeText.textContent = e.target.textContent;
            dropdownMenu.classList.remove('show');
            log(`切换搜索模式: ${e.target.textContent}`);
        });
    });

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
    const addSourceBtn = document.getElementById('addSourceBtn');
    const adminModal = document.getElementById('adminModal');
    const modalTitle = document.getElementById('modalTitle');
    const loginView = document.getElementById('loginView');
    const addView = document.getElementById('addView');
    const guestBtn = document.getElementById('guestBtn');
    
    // 全局函数，供 HTML onclick 调用
    window.openAdminModal = function() {
        adminModal.classList.add('show');
        if (guestBtn.style.display === 'block') {
            // 已经是管理员了
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
            modalTitle.textContent = '添加新搜索源';
            loginView.style.display = 'none';
            addView.style.display = 'block';
            guestBtn.style.display = 'block';
            document.getElementById('pwdInput').value = '';
            log("密码正确，切换至添加源视图");
        } else {
            log("密码错误");
            alert('密码错误！');
        }
    };

    window.logoutAdmin = function() {
        adminModal.classList.remove('show');
        guestBtn.style.display = 'none';
        log("退出管理员，切换回游客模式");
    };
});

// 供外部调用的源卡片选择
window.selectSource = function(el) {
    document.querySelectorAll('.source-card').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    log(`选中了源: ${el.textContent}`);
};