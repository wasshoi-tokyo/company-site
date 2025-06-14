document.addEventListener('DOMContentLoaded', function() {
    // ヘッダーのスクロール効果
    const header = document.querySelector('header');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // スライドショー
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;

    function showSlide(n) {
        slides.forEach(slide => {
            slide.classList.remove('active');
        });
        slides[n].classList.add('active');
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    // 最初のスライドを表示
    if (slides.length > 0) {
        showSlide(0);
        // 5秒ごとにスライドを切り替え
        setInterval(nextSlide, 5000);
    }

    // スムーススクロール
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // モバイルメニュー
    const createMobileMenu = () => {
        const nav = document.querySelector('nav');
        const mobileMenuBtn = document.createElement('div');
        mobileMenuBtn.className = 'mobile-menu-btn';
        mobileMenuBtn.innerHTML = '<span></span><span></span><span></span>';
        
        header.querySelector('.container').appendChild(mobileMenuBtn);
        
        mobileMenuBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            nav.classList.toggle('active');
        });
        
        // メニュー項目をクリックしたらメニューを閉じる
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                mobileMenuBtn.classList.remove('active');
                nav.classList.remove('active');
            });
        });
    };

    // 画面幅が768px以下の場合にモバイルメニューを作成
    if (window.innerWidth <= 768) {
        createMobileMenu();
    }

    // リサイズ時の処理
    window.addEventListener('resize', function() {
        if (window.innerWidth <= 768 && !document.querySelector('.mobile-menu-btn')) {
            createMobileMenu();
        }
    });

    // アニメーション効果
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.service-item, .case-item, .about-item, .timeline-item');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 100) {
                element.classList.add('animate');
            }
        });
    };

    // スクロール時にアニメーション効果を適用
    window.addEventListener('scroll', animateOnScroll);
    // 初期表示時にもアニメーション効果を確認
    animateOnScroll();

    // CSSに追加するアニメーションスタイル
    const style = document.createElement('style');
    style.textContent = `
        .service-item, .case-item, .about-item, .timeline-item {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .service-item.animate, .case-item.animate, .about-item.animate, .timeline-item.animate {
            opacity: 1;
            transform: translateY(0);
        }
        .mobile-menu-btn {
            display: none;
        }
        @media (max-width: 768px) {
            .mobile-menu-btn {
                display: block;
                cursor: pointer;
                width: 30px;
                height: 20px;
                position: relative;
                z-index: 1001;
            }
            .mobile-menu-btn span {
                display: block;
                width: 100%;
                height: 2px;
                background-color: var(--primary-color);
                position: absolute;
                transition: all 0.3s ease;
            }
            .mobile-menu-btn span:nth-child(1) {
                top: 0;
            }
            .mobile-menu-btn span:nth-child(2) {
                top: 9px;
            }
            .mobile-menu-btn span:nth-child(3) {
                top: 18px;
            }
            .mobile-menu-btn.active span:nth-child(1) {
                transform: rotate(45deg);
                top: 9px;
            }
            .mobile-menu-btn.active span:nth-child(2) {
                opacity: 0;
            }
            .mobile-menu-btn.active span:nth-child(3) {
                transform: rotate(-45deg);
                top: 9px;
            }
            nav {
                position: fixed;
                top: 0;
                right: -100%;
                width: 70%;
                height: 100vh;
                background-color: var(--white);
                box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
                transition: right 0.3s ease;
                z-index: 1000;
                padding-top: 80px;
            }
            nav.active {
                right: 0;
            }
            nav ul {
                flex-direction: column;
                padding: 0 2rem;
            }
            nav ul li {
                margin: 1rem 0;
            }
            header.scrolled {
                padding: 0.5rem 0;
                background-color: rgba(255, 255, 255, 0.95);
            }
        }
    `;
    document.head.appendChild(style);

    // ニュースデータを取得して表示する関数
    async function fetchAndDisplayNews() {
        try {
            const response = await fetch('https://docs.google.com/spreadsheets/d/1isWXV45Bd13i6yjZPhZNu8LAZi0_Y04pFp2Js0CVFjA/gviz/tq?tqx=out:csv');
            const csvText = await response.text();
            console.log('取得したCSVデータ:', csvText);
            
            // CSVを解析してデータを配列に格納
            const rows = csvText.trim().split('\n').slice(1); // ヘッダー行を除外
            const newsData = rows.map(row => {
                const [date, content, url] = row.split(',').map(cell => cell.replace(/^"|"$/g, ''));
                return { date, content, url };
            });

            // 日付でソート（降順）して最新5件を取得
            newsData.sort((a, b) => new Date(b.date) - new Date(a.date));
            const latestNews = newsData.slice(0, 5);

            // ニュースを表示
            const newsContainer = document.querySelector('.news-list');
            newsContainer.innerHTML = latestNews.map(item => `
                <div class="news-item">
                    <div class="news-date">${item.date}</div>
                    <div class="news-content">
                        <h3>${item.content}</h3>
                        ${item.url ? `<a href="${item.url}" target="_blank">${item.url}</a>` : ''}
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('CSVデータの取得に失敗しました:', error);
        }
    }

    // ページ読み込み時にニュースを取得
    fetchAndDisplayNews();

    // 事例紹介データを取得して表示する関数
    async function fetchAndDisplayCases() {
        console.log('fetchAndDisplayCases called');
        try {
            console.log('Fetching cases data...');
            const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vQHke_ueGyoldYnZJVbtZ-s-O7rikTuBi6gBC9Oj_-f2cQi5mytV34B4Y4WtPcL-A-t-oW-7AHTTKO0/pub?gid=0&output=csv');
            console.log('Response status:', response.status);
            const csvText = await response.text();
            console.log('取得した事例CSVデータ:', csvText);
            const rows = csvText.trim().split('\n');
            console.log('rows:', rows);
            const casesContainer = document.querySelector('.cases-grid');
            console.log('casesContainer:', casesContainer);
            if (!casesContainer) {
                console.error('cases-grid element not found');
                return;
            }
            casesContainer.innerHTML = '';
            rows.slice(1).forEach(row => {
                const cols = row.split(',').map(cell => cell.replace(/^"|"$/g, ''));
                console.log('cols:', cols);
                const title = cols[0] || '';
                const description = cols[1] || '';
                const url1 = cols[2] || '';
                const url2 = cols[3] || '';
                let html = `<div class='case-item'>`;
                html += `<h3>${title}</h3>`;
                if (url1) html += `<p><a href='${url1}' target='_blank'>${url1}</a></p>`;
                if (url2) html += `<p><a href='${url2}' target='_blank'>${url2}</a></p>`;
                if (description) html += `<p>${description}</p>`;
                html += `</div>`;
                casesContainer.innerHTML += html;
            });
        } catch (error) {
            console.error('事例紹介データの取得に失敗しました:', error);
        }
    }

    // ページ読み込み時に事例紹介を取得
    fetchAndDisplayCases();
}); 