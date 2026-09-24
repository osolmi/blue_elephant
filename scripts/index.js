(function () {
  /* ==========================================================
    1. 대괄호 링크 처리
  ========================================================== */
  function initBracketLinks() {
    // Case A — 이미 .bracket 스팬 두 개(여는/닫는 대괄호)를 가진 요소
    var spannedEls = document.querySelectorAll('.tab, .discover-all, .editorial-tile__cta');
    spannedEls.forEach(function (el) {
      var brackets = el.querySelectorAll(':scope > .bracket');
      if (brackets.length < 2) return;

      var openBracket = brackets[0];
      var closeBracket = brackets[brackets.length - 1];

      var textWrap = document.createElement('span');
      textWrap.className = 'bracket-text';

      var node = openBracket.nextSibling;
      while (node && node !== closeBracket) {
        var next = node.nextSibling;
        if (node.nodeType === 3) {
          // 텍스트 노드 앞뒤 공백 정리 (gap이 간격을 대신 담당하므로)
          node.textContent = node.textContent.trim();
        }
        textWrap.appendChild(node);
        node = next;
      }

      el.insertBefore(textWrap, closeBracket);
      el.classList.add('bracket-link');
    });

    // Case B — 순수 텍스트로 "[ TEXT ]"가 들어있는 요소 (푸터 링크)
    var plainEls = document.querySelectorAll('.footer__links a');
    plainEls.forEach(function (el) {
      var text = el.textContent.trim();
      var match = text.match(/^\[\s*(.+?)\s*\]$/);
      if (!match) return;

      el.innerHTML =
        '<span class="bracket">[</span>' +
        '<span class="bracket-text">' + match[1] + '</span>' +
        '<span class="bracket">]</span>';
      el.classList.add('bracket-link');
    });
  }

  /* ==========================================================
    2. 다크모드 토글 — 항상 라이트로 시작 (OS 설정 자동 감지 안 함)
  ========================================================== */
  var themeToggle = document.getElementById('themeToggle');
  var root = document.documentElement;

  function setTheme(isDark) {
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    if (themeToggle) themeToggle.setAttribute('aria-checked', String(isDark));
  }
  setTheme(false);

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var isDark = root.getAttribute('data-theme') === 'dark';
      setTheme(!isDark);
    });
  }

  /* ==========================================================
    3. 최근 본 상품 위젯 — 펼치기/접기, 최대 3개 제한
  ========================================================== */
  var fab = document.getElementById('fab');
  var fabAdd = document.getElementById('fabAdd');
  var fabList = document.getElementById('fabList');

  if (fab && fabAdd && fabList) {
    var fabItems = fabList.querySelectorAll('.fab__item');
    fabItems.forEach(function (item, index) {
      if (index >= 3) item.remove();
    });

    fabAdd.addEventListener('click', function () {
      var expanded = fab.classList.toggle('is-expanded');
      fabAdd.setAttribute('aria-label', expanded ? '최근 본 상품 접기' : '최근 본 상품 펼치기');
    });
  }

/* ==========================================================
   4. 베스트셀러 탭 기능 — scroll-snap 페이지네이션 버전
========================================================== */
var bestsellersData = {
  sunglasses: {
    feature: './images/bs.png',
    products: [
      { img: './images/products/GLENDA black semi.png', name: 'GLENDA black semi', price: '₩49,900' },
      { img: './images/products/RIFT pearl grey.png', name: 'RIFT pearl grey', price: '₩49,900' },
      { img: './images/products/SUENO silver.png', name: 'SUENO silver', price: '₩69,900' },
      { img: './images/products/HUSH matte silver.png', name: 'HUSH matte silver', price: '₩69,900' },
      { img: './images/products/FLUXO pearl black.png', name: 'FLUXO pearl black', price: '₩49,900' },
      { img: './images/products/DRUKI grey.png', name: 'DRUKI grey', price: '₩49,900' },
      { img: './images/products/TRIKA black.png', name: 'TRIKA black', price: '₩69,900' },
      { img: './images/products/SKID silver.png', name: 'SKID silver', price: '₩49,900' },
      { img: './images/products/VIGOR-S black.png', name: 'VIGOR-S black', price: '₩49,900' },
    ]
  },
  glasses: {
    feature: './images/bs_glasses.png',
    products: [
      { img: './images/products/KIN black.png', name: 'KIN black', price: '₩49,900' },
      { img: './images/products/LEILA khaki.png', name: 'LEILA khaki', price: '₩69,900' },
      { img: './images/products/GARNET black.png', name: 'GARNET black', price: '₩69,900' },
      { img: './images/products/PEPA grey.png', name: 'PEPA grey', price: '₩49,900' },
      { img: './images/products/ENZO matte silver.png', name: 'ENZO matte silver', price: '₩69,900' },
      { img: './images/products/CLAUDE black.png', name: 'CLAUDE black', price: '₩49,900' },
      { img: './images/products/NOUS black.png', name: 'NOUS black', price: '₩49,900' },
      // ⚠ 9개 채우려면 5개 더 추가
    ]
  }
};

function chunk(arr, size) {
  var out = [];
  for (var i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function initBestsellerTabs() {
  var section = document.querySelector('.bestsellers');
  if (!section) return;

  var tabs = section.querySelectorAll('.tab-group .tab');
  var feature = section.querySelector('.bestsellers__feature');
  var track = document.getElementById('bestsellersWrapper');
  var dotsWrap = section.querySelector('.dots');

  function render(key) {
    var data = bestsellersData[key];
    if (!data || !track) return;

    if (feature && data.feature) {
      feature.style.backgroundImage = "url('" + data.feature + "')";
    }

    var pages = chunk(data.products, 3);

    track.innerHTML = pages.map(function (page) {
      return '<div class="bs-page">' + page.map(function (p) {
        return '<a href="#shop" class="product-card">' +
          '<div class="product-card__img"><img src="' + p.img + '" alt="' + p.name + '"></div>' +
          '<p class="product-card__name">' + p.name + '</p>' +
          '<p class="product-card__price">' + p.price + '</p>' +
          '</a>';
      }).join('') + '</div>';
    }).join('');

    dotsWrap.innerHTML = pages.map(function (_, i) {
      return '<button class="dot' + (i === 0 ? ' is-active' : '') + '" data-page="' + i + '"></button>';
    }).join('');

    track.scrollTo({ left: 0 });

    dotsWrap.querySelectorAll('.dot').forEach(function (dot) {
      dot.addEventListener('click', function () {
        track.scrollTo({ left: track.clientWidth * Number(dot.dataset.page), behavior: 'smooth' });
      });
    });
  }

  track.addEventListener('scroll', function () {
    var i = Math.round(track.scrollLeft / track.clientWidth);
    dotsWrap.querySelectorAll('.dot').forEach(function (dot, idx) {
      dot.classList.toggle('is-active', idx === i);
    });
  });

  render('sunglasses');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('is-active'); });
      tab.classList.add('is-active');
      render(tab.dataset.tab);
    });
  });
}

  /* ==========================================================
    5. 컬렉션(discover) 섹션 카테고리 탭 — 상품 리스트 전환
  ========================================================== */
var categoryData = {
  sunglasses2: [
    { img: './images/products/LOOM grey.png', name: 'LOOM grey', price: '₩49,900' },
    { img: './images/products/LIMIA black.png', name: 'LIMIA black', price: '₩69,900' },
    { img: './images/products/TEN silver.png', name: 'TEN silver', price: '₩49,900' },
    { img: './images/products/RICK black.png', name: 'RICK grey', price: '₩49,900' }
  ],
  glasses2: [
    { img: './images/products/CHENS silver.png', name: 'CHENS silver', price: '₩69,900' },
    { img: './images/products/PEPA grey.png', name: 'PEPA grey', price: '₩49,900' },
    { img: './images/products/DOVE black.png', name: 'DOVE black', price: '₩69,900' },
    { img: './images/products/DUBON leopard.png', name: 'DUBON leopard', price: '₩49,900' }
  ]
};

function initCategoryTabs() {
  var section = document.querySelector('.discover .category');
  if (!section) return;

  var tabs = section.querySelectorAll('.category-head .tab');
  var grid = section.querySelector('.category-grid');

  function render(key) {
    var products = categoryData[key];
    if (!products) return;

    grid.innerHTML = products.map(function (p) {
      return (
        '<a href="#" class="product-card">' +
          '<div class="product-card__img"><img src="' + p.img + '" alt="' + p.name + '"></div>' +
          '<p class="product-card__name">' + p.name + '</p>' +
          '<p class="product-card__price">' + p.price + '</p>' +
        '</a>'
      );
    }).join('');
  }

  render('sunglasses2');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('is-active'); });
      tab.classList.add('is-active');
      render(tab.dataset.tab);
    });
  });
}

  /* ==========================================================
    초기화
  ========================================================== */
  document.addEventListener('DOMContentLoaded', function () {
    initBracketLinks();
    initBestsellerTabs();
    initCategoryTabs();
  });

})();