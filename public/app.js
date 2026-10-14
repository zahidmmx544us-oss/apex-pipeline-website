// Apex Pipeline Media - High-Converting Interactive Frontend Script

// Global Tab Switcher Function for Conversion Hub
window.switchConversionTab = function(tabName) {
  const tabCalendlyBtn = document.getElementById('tabCalendlyBtn');
  const tabSampleFormBtn = document.getElementById('tabSampleFormBtn');
  const paneCalendly = document.getElementById('paneCalendly');
  const paneSampleForm = document.getElementById('paneSampleForm');

  if (!tabCalendlyBtn || !tabSampleFormBtn || !paneCalendly || !paneSampleForm) return;

  if (tabName === 'calendar') {
    tabCalendlyBtn.classList.add('active');
    tabCalendlyBtn.setAttribute('aria-selected', 'true');
    tabSampleFormBtn.classList.remove('active');
    tabSampleFormBtn.setAttribute('aria-selected', 'false');

    paneCalendly.classList.add('active');
    paneSampleForm.classList.remove('active');
  } else {
    tabSampleFormBtn.classList.add('active');
    tabSampleFormBtn.setAttribute('aria-selected', 'true');
    tabCalendlyBtn.classList.remove('active');
    tabCalendlyBtn.setAttribute('aria-selected', 'false');

    paneSampleForm.classList.add('active');
    paneCalendly.classList.remove('active');
  }
};

document.addEventListener('DOMContentLoaded', () => {

  // 1. VSL (Video Sales Letter) Video Playback Handler
  const vslPoster = document.getElementById('vslPoster');
  const vslIframe = document.getElementById('vslIframe');

  if (vslPoster && vslIframe) {
    vslPoster.addEventListener('click', () => {
      // Fade out poster and trigger video playback
      vslPoster.style.opacity = '0';
      vslPoster.style.pointerEvents = 'none';
      setTimeout(() => {
        vslPoster.style.display = 'none';
      }, 300);

      // Reload iframe with autoplay enabled if not already playing
      let currentSrc = vslIframe.getAttribute('src');
      if (!currentSrc.includes('autoplay=1')) {
        vslIframe.src = currentSrc + '&autoplay=1';
      }
    });
  }

  // 2. Interactive "Are You A Fit?" Self-Qualification Assessment
  const fitChecklist = document.getElementById('fitChecklist');
  const fitScoreText = document.getElementById('fitScoreText');
  const fitProgressFill = document.getElementById('fitProgressFill');
  const fitStatusBanner = document.getElementById('fitStatusBanner');
  const fitStatusSub = document.getElementById('fitStatusSub');

  if (fitChecklist) {
    const fitCards = fitChecklist.querySelectorAll('.fit-card');

    function updateQualificationScore() {
      const totalCards = fitCards.length;
      let selectedCount = 0;

      fitCards.forEach(card => {
        if (card.classList.contains('selected')) {
          selectedCount++;
        }
      });

      const percentage = Math.round((selectedCount / totalCards) * 100);

      if (fitScoreText) fitScoreText.textContent = `${percentage}% Match`;
      if (fitProgressFill) fitProgressFill.style.width = `${percentage}%`;

      if (fitStatusBanner && fitStatusSub) {
        if (percentage >= 80) {
          fitStatusBanner.innerHTML = '🎉 100% Ideal Match: Your firm qualifies for our Guaranteed Outbound Pipeline!';
          fitStatusBanner.style.color = '#00f5a0';
          fitStatusSub.textContent = 'Our data engineering team has immediate capacity for only 3 new clients this month. Proceed below to reserve your slot and book your 1-on-1 strategy call.';
        } else if (percentage >= 40) {
          fitStatusBanner.innerHTML = '⚡ Strong Match: Your business profile qualifies for custom outbound pipeline rollout.';
          fitStatusBanner.style.color = '#38bdf8';
          fitStatusSub.textContent = 'Your business model fits our outbound infrastructure. Let’s map out your Total Addressable Market (TAM) on a 20-minute discovery call.';
        } else {
          fitStatusBanner.innerHTML = '📋 Select your business criteria above to calculate your outbound readiness score.';
          fitStatusBanner.style.color = '#ffffff';
          fitStatusSub.textContent = 'We work with B2B companies looking to predictably book 15–30 qualified C-suite meetings every single month.';
        }
      }
    }

    fitCards.forEach(card => {
      card.addEventListener('click', () => {
        card.classList.toggle('selected');
        updateQualificationScore();
      });
    });

    // Run initial tally
    updateQualificationScore();
  }

  // 3. Conversion Hub Tabs (Calendly vs Lead Form)
  const tabCalendlyBtn = document.getElementById('tabCalendlyBtn');
  const tabSampleFormBtn = document.getElementById('tabSampleFormBtn');

  if (tabCalendlyBtn && tabSampleFormBtn) {
    tabCalendlyBtn.addEventListener('click', () => {
      window.switchConversionTab('calendar');
    });

    tabSampleFormBtn.addEventListener('click', () => {
      window.switchConversionTab('leads');
    });
  }

  // 4. FAQ Accordion Interaction
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(otherItem => {
          if (otherItem !== item) otherItem.classList.remove('active');
        });
        item.classList.toggle('active', !isActive);
      });
    }
  });

  // 5. High-Converting Free 25 Leads Form Handling (Google Sheets sync)
  const leadForm = document.getElementById('leadRequestForm');
  const submitBtn = document.getElementById('submitFormBtn');
  const successBox = document.getElementById('formSuccessMessage');

  if (leadForm) {
    leadForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('clientName').value.trim();
      const email = document.getElementById('clientEmail').value.trim();
      const company = document.getElementById('clientCompany').value.trim();
      const icp = document.getElementById('clientICP').value.trim();
      const option = document.getElementById('preferredCall').value;

      // Loading state
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing Your Request...';

      try {
        const googleAppUrl = 'https://script.google.com/macros/s/AKfycbzBpjJTLevXxpxeyt7Cakyv0LtaA-GZYEPmMgAOUxt42OX-Xma4QFYbwU4n6qOzGm2V/exec';

        await fetch(googleAppUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, company, targetICP: icp, selectedOption: option })
        });

        try {
          fetch('/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, company, targetICP: icp, selectedOption: option })
          });
        } catch (_) {}

        if (successBox) {
          successBox.style.display = 'block';
          successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        leadForm.reset();
        submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Request Sent Successfully!';
        submitBtn.style.background = '#059669';

        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
          submitBtn.style.background = '';
        }, 5000);

      } catch (err) {
        console.error('Lead submission error:', err);
        if (successBox) {
          successBox.style.display = 'block';
          successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        leadForm.reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    });
  }

  // 6. Smooth scroll for all CTA anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // 7. Navbar Background Scroll Effect
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.style.background = 'rgba(7, 11, 20, 0.95)';
      navbar.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
    } else {
      navbar.style.background = 'rgba(7, 11, 20, 0.82)';
      navbar.style.boxShadow = 'none';
    }
  });

});
