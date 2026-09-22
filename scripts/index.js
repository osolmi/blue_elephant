(function () {

  /* ==========================================================
     1. 브래킷 링크 자동 래핑
     [ TEXT ] 형태의 요소를 찾아서 .bracket-link + .bracket-text
     구조로 만들어준다. HTML에 이미 <span class="bracket">가
     있는 요소(탭, discover-all, editorial cta)는 가운데 내용만
     감싸주고, 푸터 링크처럼 순수 텍스트("[INSTAGRAM]")인 요소는
     처음부터 구조를 만들어준다.
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
     4. 베스트셀러 탭 — 좌측 비주얼 + 상품 그리드 + 도트 연동
     ⚠ 아래 data 안의 이미지 경로/상품명/가격은 예시 placeholder.
        실제 에셋이 준비되면 이 객체 값만 교체하면 됨.
  ========================================================== */
  var bestsellersData = {
    sunglasses: {
      feature: './images/bs.png',
      products: [
        { img: './images/products/LOOM grey.png', name: 'LOOM grey', price: '49,900₩' },
        { img: './images/products/LOOM grey.png', name: 'LOOM grey', price: '49,900₩' },
        { img: './images/products/LOOM grey.png', name: 'LOOM grey', price: '49,900₩' }
      ]
    },
    glasses: {
      feature: './images/bs_glasses.png',
      products: [
        { img: './images/products/VIST clear.png', name: 'VIST clear', price: '39,900₩' },
        { img: './images/products/VIST clear.png', name: 'VIST clear', price: '39,900₩' },
        { img: './images/products/VIST clear.png', name: 'VIST clear', price: '39,900₩' }
      ]
    }
  };

  function initBestsellerTabs() {
    var section = document.querySelector('.bestsellers');
    if (!section) return;

    var tabs = section.querySelectorAll('.tab-group .tab');
    var feature = section.querySelector('.bestsellers__feature');
    var productRow = section.querySelector('.product-row');
    var dots = section.querySelectorAll('.dots .dot');

    function render(key) {
      var data = bestsellersData[key];
      if (!data) return;

      feature.style.backgroundImage = "url('" + data.feature + "')";

      productRow.innerHTML = data.products.map(function (p) {
        return (
          '<a href="#shop" class="product-card">' +
            '<div class="product-card__img"><img src="' + p.img + '" alt=""></div>' +
            '<p class="product-card__name">' + p.name + '</p>' +
            '<p class="product-card__price">' + p.price + '</p>' +
          '</a>'
        );
      }).join('');

      // 카테고리 전환 시 페이지네이션은 첫 도트로 리셋
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === 0);
      });
    }

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
     ⚠ product-card__img는 현재 실제 에셋이 없어 플레이스홀더로 둠.
  ========================================================== */
  var categoryData = {
    sunglasses2: [
      { name: 'LOOM grey', price: '49,900₩' },
      { name: 'LOOM grey', price: '49,900₩' },
      { name: 'LOOM grey', price: '49,900₩' },
      { name: 'LOOM grey', price: '49,900₩' }
    ],
    glasses2: [
      { name: 'VIST clear', price: '39,900₩' },
      { name: 'VIST clear', price: '39,900₩' },
      { name: 'VIST clear', price: '39,900₩' },
      { name: 'VIST clear', price: '39,900₩' }
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
            '<div class="product-card__img"></div>' +
            '<p class="product-card__name">' + p.name + '</p>' +
            '<p class="product-card__price">' + p.price + '</p>' +
          '</a>'
        );
      }).join('');
    }

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