// API配置
const API_BASE = 'https://api.artic.edu/api/v1';
const IIIF_BASE = 'https://www.artic.edu/iiif/2';

// DOM元素
const yearInput = document.getElementById('yearInput');
const searchBtn = document.getElementById('searchBtn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const artworkContainer = document.getElementById('artworkContainer');
const artworkImg = document.getElementById('artworkImg');
const artworkTitle = document.getElementById('artworkTitle');
const artworkArtist = document.getElementById('artworkArtist');
const artworkDate = document.getElementById('artworkDate');
const artworkMedium = document.getElementById('artworkMedium');
const artworkDimensions = document.getElementById('artworkDimensions');
const artworkLink = document.getElementById('artworkLink');

// 事件监听
searchBtn.addEventListener('click', searchArtwork);
yearInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchArtwork();
    }
});

// 搜索艺术品
async function searchArtwork() {
    const year = yearInput.value.trim();
    
    if (!year) {
        showError('请输入年份');
        return;
    }
    
    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 1 || yearNum > 2024) {
        showError('请输入有效的年份 (1-2024)');
        return;
    }
    
    // 显示加载状态
    showLoading();
    hideError();
    hideArtwork();
    
    try {
        // 第一步：获取该年份且有公开图片的画作总数
        const countRequestBody = {
            limit: 0,
            query: {
                bool: {
                    must: [
                        { term: { date_display: year } },
                        { exists: { field: 'image_id' } },
                        { term: { is_public_domain: true } },
                        { match: { classification_title: 'painting' } }
                    ]
                }
            }
        };
        
        console.log('=== 获取有图片的作品总数 ===');
        console.log('查询条件:', countRequestBody);
        
        const countResponse = await fetch(`${API_BASE}/artworks/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(countRequestBody)
        });
        
        if (!countResponse.ok) {
            throw new Error('获取作品总数失败');
        }
        
        const countData = await countResponse.json();
        const total = countData.pagination.total;
        
        console.log(`年份 ${year} 有公开图片的画作总数:`, total);
        
        if (total === 0) {
            showError(`未找到 ${year} 年有公开图片的画作`);
            hideLoading();
            return;
        }
        
        // 添加延迟以避免API频率限制
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // 第二步：生成随机偏移量
        const randomOffset = Math.floor(Math.random() * total);
        console.log('随机偏移量:', randomOffset);
        
        // 第三步：从随机位置获取一个有公开图片的画作
        const artworkRequestBody = {
            limit: 1,
            from: randomOffset,
            fields: ['id', 'title', 'artist_display', 'date_display', 'medium_display', 'dimensions', 'image_id', 'artwork_type_title', 'classification_title', 'department_title'],
            query: {
                bool: {
                    must: [
                        { term: { date_display: year } },
                        { exists: { field: 'image_id' } },
                        { term: { is_public_domain: true } },
                        { match: { classification_title: 'painting' } }
                    ]
                }
            }
        };
        
        console.log('=== 获取随机作品 ===');
        console.log('查询条件:', artworkRequestBody);
        
        const artworkResponse = await fetch(`${API_BASE}/artworks/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(artworkRequestBody)
        });
        
        if (!artworkResponse.ok) {
            throw new Error('获取作品失败');
        }
        
        const data = await artworkResponse.json();
        
        console.log('=== 收到API响应 ===');
        console.log('完整响应:', data);
        console.log('数据数组长度:', data.data?.length || 0);
        if (data.data && data.data.length > 0) {
            console.log('作品数据:', data.data[0]);
        }
        
        if (!data.data || data.data.length === 0) {
            throw new Error(`没有找到 ${year} 年的艺术品（偏移量 ${randomOffset}）`);
        }
        
        // 显示随机选择的作品
        displayArtwork(data.data[0]);
        
    } catch (err) {
        console.error('错误:', err);
        showError(err.message || '获取艺术品时出错，请稍后再试');
    } finally {
        hideLoading();
    }
}

// 显示艺术品
function displayArtwork(artwork) {
    // 构建IIIF图片URL
    const imageUrl = `${IIIF_BASE}/${artwork.image_id}/full/843,/0/default.jpg`;
    
    // 设置图片
    artworkImg.src = imageUrl;
    artworkImg.alt = artwork.title || 'Artwork';
    
    // 添加图片加载错误处理
    artworkImg.onerror = function() {
        console.error('图片加载失败:', imageUrl);
        this.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="%23f0f0f0"/><text x="50%" y="50%" font-size="20" text-anchor="middle" fill="%23999">图片暂时无法加载</text></svg>';
    };
    
    // 设置信息
    artworkTitle.textContent = artwork.title || '无标题';
    artworkArtist.textContent = artwork.artist_display || '艺术家未知';
    artworkDate.textContent = artwork.date_display || '';
    artworkMedium.textContent = artwork.medium_display || '';
    artworkDimensions.textContent = artwork.dimensions || '';
    
    // 设置链接
    artworkLink.href = `https://www.artic.edu/artworks/${artwork.id}`;
    
    // 显示容器
    artworkContainer.classList.remove('hidden');
}

// 工具函数
function showLoading() {
    loading.classList.remove('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
}

function showError(message) {
    error.textContent = message;
    error.classList.remove('hidden');
}

function hideError() {
    error.classList.add('hidden');
}

function hideArtwork() {
    artworkContainer.classList.add('hidden');
}