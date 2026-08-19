let promoBannerConfig = {
  enabled: true,
  badgeText: "LIMITED FESTIVAL DEAL",
  couponCode: "BLOOM10",
  title: "Get Flat 10% OFF + Free Morning Delivery on Fresh Flowers & Garlands!",
  subtitle: "Handpicked fresh blooms delivered directly from local flower markets to your doorstep before sunrise.",
  buttonText: "Claim 10% Offer Now"
};

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json(promoBannerConfig);
  }

  if (req.method === 'POST') {
    const { enabled, badgeText, couponCode, title, subtitle, buttonText } = req.body || {};
    promoBannerConfig = {
      enabled: enabled !== undefined ? Boolean(enabled) : promoBannerConfig.enabled,
      badgeText: badgeText || promoBannerConfig.badgeText,
      couponCode: couponCode || promoBannerConfig.couponCode,
      title: title || promoBannerConfig.title,
      subtitle: subtitle || promoBannerConfig.subtitle,
      buttonText: buttonText || promoBannerConfig.buttonText
    };
    return res.status(200).json({ success: true, promoBanner: promoBannerConfig });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
