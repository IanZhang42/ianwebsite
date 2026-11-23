(() => {
  const papers = {
    tempering: {
      title: "The Impact of Likelihood Tempering on the Limiting Predictive Moments of Variational Bayesian Linear Neural Networks",
      authors: "Ian Zhang and Thibault Randrianarisoa",
      status: "Preprint · 2026",
      summary: "As a Bayesian neural network grows wider, its variational predictions can become dominated by the prior. We study what happens when we give the observations more weight during training. In a single-hidden-layer linear network, the predictive mean and variance begin to respond at different temperature scales.",
      article: "https://arxiv.org/abs/2610.09132",
      linkLabel: "Read preprint"
    },
    markov: {
      title: "Markov Processes for Enhanced Deepfake Generation and Detection",
      authors: "Michael A. Kouritzin, Ian Zhang, Jyoti Bhadana, and Seoyeon Park",
      status: "Published · AIMS Mathematics · 2026",
      summary: "A sequence of heads and tails gives us a simple setting for studying authenticity. We introduce a Markov observation model that learns patterns in binary sequences and use it to investigate how synthetic data can be generated and detected.",
      article: "https://doi.org/10.3934/math.2026483",
      linkLabel: "Read article"
    },
    spatial: {
      title: "Parametric Hotspot Analysis with the Getis–Ord Statistic",
      authors: "Aditya Khan and Ian Zhang",
      status: "Under review · 2026",
      summary: "When is a neighborhood of high values unusual relative to the surrounding spatial pattern? This project studies a parametric approach to that question using the Getis–Ord statistic."
    }
  };

  function makeLink(href, label, style) {
    const link = document.createElement("a");
    link.href = href;
    link.textContent = label;
    link.className = "btn " + style;
    return link;
  }

  const dialog = document.getElementById("paper-dialog");
  if (dialog && typeof dialog.showModal === "function") {
    const fields = {
      title: dialog.querySelector("#paper-title"),
      authors: dialog.querySelector("#paper-authors"),
      status: dialog.querySelector("#paper-meta"),
      summary: dialog.querySelector("#paper-summary")
    };
    const image = dialog.querySelector("#paper-image");
    const links = dialog.querySelector(".paper-links");
    const close = dialog.querySelector(".close-modal");
    let openedBy;

    document.querySelectorAll("a[data-paper]").forEach(card => {
      card.setAttribute("aria-haspopup", "dialog");
      card.addEventListener("click", event => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const paper = papers[card.dataset.paper];
        if (!paper) return;

        for (const [key, field] of Object.entries(fields)) field.textContent = paper[key];
        image.src = card.querySelector("img").src;
        links.replaceChildren();
        if (paper.article) links.append(makeLink(paper.article, paper.linkLabel, "primary"));
        links.append(makeLink(card.href, "Research record", paper.article ? "secondary" : "primary"));

        event.preventDefault();
        openedBy = card;
        dialog.showModal();
        dialog.scrollTop = 0;
        close.focus({ preventScroll: true });
      });
    });

    close.addEventListener("click", () => dialog.close());
    dialog.addEventListener("close", () => openedBy?.focus({ preventScroll: true }));
    dialog.addEventListener("click", event => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    });
  }

  const hint = document.getElementById("density-hint");
  if (hint) {
    const rotationIcon = hint.closest(".plot-hint")?.querySelector(".icon");
    const modes = document.querySelectorAll("[data-density-mode]");
    function updateHint(mode) {
      const isContour = mode === "contours";
      hint.textContent = isContour ? "Equal-density contours" : "Drag to rotate";
      if (rotationIcon) rotationIcon.style.display = isContour ? "none" : "";
    }
    modes.forEach(button => button.addEventListener("click", () => updateHint(button.dataset.densityMode)));
  }
})();
