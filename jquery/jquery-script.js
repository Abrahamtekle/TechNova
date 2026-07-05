/* ==========================================================================
   TechNova Electronics — jQuery Interactions
   Every method on the practical's required jQuery list is demonstrated
   here against a real feature (see inline notes).
   ========================================================================== */

$(function () {

  /* ---------- Fade-in on load: hero copy + section cards (fadeIn) ---------- */
  $(".hero-copy, .hero-media").css("opacity", 0).each(function (i) {
    $(this).delay(i * 150).animate({ opacity: 1 }, 500);
  });

  // Stagger-fade any freshly rendered cards (category / product grids)
  function tnJQueryRevealCards() {
    $(".fade-init").each(function (i) {
      const $el = $(this);
      $el.css({ opacity: 0 });
      setTimeout(() => { $el.animate({ opacity: 1 }, 400); $el.removeClass("fade-init"); }, i * 60);
    });
  }
  // Run after the vanilla renderers have injected markup
  setTimeout(tnJQueryRevealCards, 60);
  // Re-run whenever product/category grids are re-rendered (custom event)
  $(document).on("tn:rerender", tnJQueryRevealCards);

  /* ---------- Mobile nav slide menu (addClass / removeClass) ---------- */
  $("#burgerBtn").on("click", function () {
    $("#mobileNav").addClass("open");
    $("#navOverlay").addClass("show");
  });
  $("#closeMobileNav, #navOverlay").on("click", function () {
    $("#mobileNav").removeClass("open");
    $("#navOverlay").removeClass("show");
  });

  /* ---------- Smooth scroll: "Shop Now" -> Featured Products (click) ---------- */
  $(".js-scroll-to").on("click", function (e) {
    e.preventDefault();
    const target = $($(this).attr("href"));
    if (target.length) {
      $("html, body").animate({ scrollTop: target.offset().top - 90 }, 650);
    }
  });

  /* ---------- Scroll-to-top button (fadeIn / fadeOut) ---------- */
  const $scrollTop = $("#scrollTopBtn");
  $(window).on("scroll", function () {
    if ($(window).scrollTop() > 400) $scrollTop.fadeIn(200);
    else $scrollTop.fadeOut(200);
  });
  $scrollTop.on("click", function () {
    $("html, body").animate({ scrollTop: 0 }, 500);
  });

  /* ---------- Category card hover animation (hover) ---------- */
  $(document).on("hover", ".cat-card", function () {
    $(this).find(".cat-icon").toggleClass("hovered");
  });
  // hover() shorthand needs delegation fallback for dynamically-added cards:
  $(document).on("mouseenter", ".cat-card", function () { $(this).find(".cat-icon").addClass("hovered"); });
  $(document).on("mouseleave", ".cat-card", function () { $(this).find(".cat-icon").removeClass("hovered"); });

  /* ---------- Accordion sections: About FAQ + Product spec accordion ---------- */
  $(document).on("click", ".accordion-head", function () {
    const $item = $(this).closest(".accordion-item");
    const $body = $item.find(".accordion-body");
    if ($item.hasClass("open")) {
      $body.slideUp(250, () => $item.removeClass("open"));
    } else {
      $item.addClass("open");
      $body.slideDown(250);
    }
  });

  /* ---------- Featured Categories accordion-style "Shop by need" panel (slideToggle) ---------- */
  $("#toggleHelpPanel").on("click", function () {
    $("#helpPanelBody").slideToggle(300);
    $(this).toggleClass("open");
  });

  /* ---------- Mobile filter panel toggle on Products page (slideToggle) ---------- */
  $("#mobileFilterToggle").on("click", function () {
    $("#filterPanel").slideToggle(280);
  });

  /* ---------- jQuery Tabs: product details (Specifications / Reviews / Description) ---------- */
  $(document).on("click", ".tabs-nav button", function () {
    const target = $(this).data("tab");
    $(this).siblings().removeClass("active");
    $(this).addClass("active");
    $(".tab-panel").removeClass("active").hide();
    $("#" + target).addClass("active").fadeIn(250);
  });

  /* ---------- Wishlist heart pulse (animate + toggleClass) ---------- */
  $(document).on("click", ".wishlist-btn", function () {
    $(this).toggleClass("pulse");
    $(this).animate({ opacity: 0.4 }, 100).animate({ opacity: 1 }, 200);
  });

  /* ---------- "Read more" toggle for About company story (toggle) ---------- */
  $("#readMoreBtn").on("click", function () {
    $("#storyMore").toggle(300);
    $(this).text($(this).text() === "Read more →" ? "Show less ←" : "Read more →");
  });

  /* ---------- Newsletter subscribe confirmation (fadeToggle) ---------- */
  $("#newsletterForm").on("submit", function (e) {
    e.preventDefault();
    const email = $(this).find("input[type=email]").val();
    if (!email || !email.includes("@")) {
      $("#newsletterMsg").text("Please enter a valid email.").css("color", "#e08a8a").fadeIn(200);
      return;
    }
    $(this).find("input[type=email]").val("");
    $("#newsletterMsg").text(`Subscribed! Deals incoming at ${email}`).css("color", "#F2A93B");
    $("#newsletterMsg").fadeToggle(200).fadeToggle(200);
  });

  /* ---------- Character counter for contact message (keyup) ---------- */
  $("#contactMessage").on("keyup", function () {
    const len = $(this).val().length;
    $("#msgCharCount").text(len + " / 500");
    $("#msgCharCount").css("color", len < 20 ? "#C0392B" : "#4B5560");
  });

  /* ---------- Contact form input highlight (hover + focus classes) ---------- */
  $(".form-field input, .form-field textarea").on("focus", function () {
    $(this).closest(".form-field").addClass("field-focus");
  }).on("blur", function () {
    $(this).closest(".form-field").removeClass("field-focus");
  });

  /* ---------- Contact form submit -> slide confirmation (slideDown / hide) ---------- */
  $("#contactForm").on("submit", function (e) {
    e.preventDefault();
    const valid = tnValidateContactForm();
    if (!valid) return;
    $(this).hide(200);
    $("#contactConfirm").addClass("show").slideDown(300);
  });

  /* ---------- Sort & filter selects on Products page (change) ---------- */
  $(document).on("change", "#sortSelect", function () {
    tnApplySortAndFilter();
  });
  $(document).on("change", ".filter-body input", function () {
    tnApplySortAndFilter();
  });

  /* ---------- Filter group collapse (toggleClass + slideToggle) ---------- */
  $(document).on("click", ".filter-group h4", function () {
    $(this).closest(".filter-group").toggleClass("collapsed");
    $(this).next(".filter-body").slideToggle(200);
  });

  /* ---------- Payment method selection visuals (change) ---------- */
  $(document).on("change", "input[name=paymentMethod]", function () {
    $(".pay-methods label").removeClass("selected-pay");
    $(this).closest("label").addClass("selected-pay");
    if ($(this).val() === "card") $("#cardFields").addClass("show").show();
    else $("#cardFields").removeClass("show").hide();
  });

  /* ---------- Quantity stepper pulse (product details) — animate() ---------- */
  $(document).on("click", ".qty-selector button", function () {
    $(this).closest(".qty-selector").find("input").animate({ opacity: 0.3 }, 80).animate({ opacity: 1 }, 120);
  });

  /* ---------- Product gallery thumbnail switch (click + addClass/removeClass) ---------- */
  $(document).on("click", ".pd-thumbs .thumb", function () {
    $(".pd-thumbs .thumb").removeClass("active");
    $(this).addClass("active");
    const src = $(this).find("img").attr("src");
    $("#pdMainImage").fadeOut(120, function () {
      $(this).attr("src", src).fadeIn(180);
    });
  });

});

/* Fire a rerender event other scripts can use to trigger jQuery reveal */
function tnJQueryTriggerRerender() { $(document).trigger("tn:rerender"); }
