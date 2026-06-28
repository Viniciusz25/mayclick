import pool from '../db.js';

const sanitizeError = (error) => ({
  message: error.message,
  code: error.code,
});

const mapSettings = (settings = {}) => ({
  company_name: settings.company_name || '',
  trade_name: settings.trade_name || '',
  cnpj: settings.cnpj || '',
  phone: settings.phone || '',
  whatsapp: settings.whatsapp || settings.phone || '',
  email: settings.email || '',
  website: settings.website || settings.site || '',
  site: settings.site || settings.website || '',
  instagram: settings.instagram || '',
  address: settings.address || '',
  budget_validity_days: settings.budget_validity_days || 5,
  pdf_validity: settings.pdf_validity || String(settings.budget_validity_days || 5),
  pdf_footer: settings.pdf_footer || '',
  contract_text: settings.contract_text || '',
  institutional_text: settings.institutional_text || '',
  payment_terms: settings.payment_terms || '',
  name: settings.trade_name || settings.company_name || '',
  
  // Dynamic homepage fields
  hero_title: settings.hero_title || '',
  hero_subtitle: settings.hero_subtitle || '',
  hero_btn_text: settings.hero_btn_text || 'Solicitar Orçamento',
  hero_btn_link: settings.hero_btn_link || '/formulario',
  hero_image_url: settings.hero_image_url || '',
  hero_carousel_category_slug: settings.hero_carousel_category_slug || null,
  hero_active: settings.hero_active !== false,
  about_title: settings.about_title || 'A Mayclick Photography',
  about_image_url: settings.about_image_url || '',
  about_video_url: settings.about_video_url || '',
  about_parallax_image_url: settings.about_parallax_image_url || '',
  about_button_text: settings.about_button_text || 'Saiba Mais',
  about_button_link: settings.about_button_link || '/sobre',
  stat_stories: settings.stat_stories || '+3.000',
  stat_events: settings.stat_events || '+500',
  stat_clients: settings.stat_clients || 'Clientes Satisfeitos',
  stat_experience: settings.stat_experience || 'Profissional',
  instagram_username: settings.instagram_username || 'mayclick',
  instagram_active: settings.instagram_active !== false,
  portfolio_active: settings.portfolio_active !== false,
  highlights_active: settings.highlights_active !== false,
  about_active: settings.about_active !== false,
  testimonials_active: settings.testimonials_active !== false,
  cta_active: settings.cta_active !== false,
  portfolio_eyebrow: settings.portfolio_eyebrow || 'Nosso Portfólio',
  portfolio_title: settings.portfolio_title || 'Conheça Nosso Trabalho',
  portfolio_description: settings.portfolio_description || 'Selecione uma categoria para visualizar nossas galerias exclusivas',
  testimonials_eyebrow: settings.testimonials_eyebrow || 'O Que Dizem',
  testimonials_title: settings.testimonials_title || 'Depoimentos de Clientes',
  cta_title: settings.cta_title || 'Vamos contar sua história?',
  cta_text: settings.cta_text || 'Solicite seu orçamento e descubra como podemos eternizar seu momento especial.',
  cta_button_text: settings.cta_button_text || 'Solicitar Orçamento',
  instagram_eyebrow: settings.instagram_eyebrow || 'Siga no Instagram',
  instagram_title: settings.instagram_title || 'Acompanhe nosso trabalho em tempo real',
  instagram_description: settings.instagram_description || 'Fique por dentro dos bastidores e novidades diárias',
  instagram_widget_code: settings.instagram_widget_code || '',
  seo_title: settings.seo_title || '',
  seo_description: settings.seo_description || '',
  seo_keywords: settings.seo_keywords || '',
  seo_og_image: settings.seo_og_image || '',
  
  // Customization
  color_primary: settings.color_primary || '#1A1A1A',
  color_accent: settings.color_accent || '#B38E5D',
  font_heading: settings.font_heading || 'Outfit',
  font_body: settings.font_body || 'Inter',
  about_page_hero_image: settings.about_page_hero_image || '',
  about_page_text: settings.about_page_text || '',
  about_page_gallery_1: settings.about_page_gallery_1 || '',
  about_page_gallery_2: settings.about_page_gallery_2 || '',
  about_page_gallery_3: settings.about_page_gallery_3 || '',

  contact: {
    whatsapp: settings.whatsapp || settings.phone || '',
    email: settings.email || '',
    website: settings.website || settings.site || '',
    instagram: settings.instagram || '',
    cnpj: settings.cnpj || '',
    address: settings.address || '',
  },
  pdf: {
    title: settings.company_name || '',
    validity: settings.pdf_validity || String(settings.budget_validity_days || 5),
    footer: settings.pdf_footer || '',
  },
});

const firstText = (...values) => {
  const value = values.find((item) => item !== undefined && item !== null);
  return value === undefined ? '' : String(value);
};

const firstBoolean = (...values) => {
  const value = values.find((item) => item !== undefined && item !== null);
  return value === true || value === 'true' || value === 1 || value === '1';
};

const nullableInt = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
};

export const getSettings = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM business_settings LIMIT 1');
    const settings = result.rows[0] || {};
    res.json(mapSettings(settings));
  } catch (error) {
    console.error('Error fetching settings:', sanitizeError(error));
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const updateSettings = async (req, res) => {
  const payload = req.body || {};
  const contact = payload.contact || {};
  const pdf = payload.pdf || {};

  const trade_name = firstText(payload.trade_name, payload.name, payload.company_name);
  const company_name = firstText(payload.company_name, pdf.title, trade_name);
  const cnpj = firstText(payload.cnpj, contact.cnpj);
  const whatsapp = firstText(payload.whatsapp, contact.whatsapp, payload.phone, contact.phone);
  const phone = firstText(payload.phone, contact.phone, whatsapp);
  const email = firstText(payload.email, contact.email);
  const website = firstText(payload.website, payload.site, contact.website, contact.site);
  const site = firstText(payload.site, payload.website, contact.site, contact.website);
  const instagram = firstText(payload.instagram, contact.instagram);
  const address = firstText(payload.address, contact.address);
  const pdf_validity = firstText(payload.pdf_validity, pdf.validity, payload.budget_validity_days);
  const budget_validity_days = nullableInt(payload.budget_validity_days ?? pdf_validity);
  const pdf_footer = firstText(payload.pdf_footer, pdf.footer);
  const payment_terms = firstText(payload.payment_terms);
  const contract_text = firstText(payload.contract_text);
  const institutional_text = firstText(payload.institutional_text);

  // Home configuration fields
  const hero_active = firstBoolean(payload.hero_active);
  const instagram_active = firstBoolean(payload.instagram_active);
  const portfolio_active = firstBoolean(payload.portfolio_active);
  const highlights_active = firstBoolean(payload.highlights_active);
  const about_active = firstBoolean(payload.about_active);
  const testimonials_active = firstBoolean(payload.testimonials_active);
  const cta_active = firstBoolean(payload.cta_active);
  const portfolio_eyebrow = firstText(payload.portfolio_eyebrow);
  const portfolio_title = firstText(payload.portfolio_title);
  const portfolio_description = firstText(payload.portfolio_description);
  const testimonials_eyebrow = firstText(payload.testimonials_eyebrow);
  const testimonials_title = firstText(payload.testimonials_title);
  const cta_title = firstText(payload.cta_title);
  const cta_text = firstText(payload.cta_text);
  const cta_button_text = firstText(payload.cta_button_text);
  const instagram_eyebrow = firstText(payload.instagram_eyebrow);
  const instagram_title = firstText(payload.instagram_title);
  const instagram_description = firstText(payload.instagram_description);
  const hero_title = firstText(payload.hero_title);
  const hero_subtitle = firstText(payload.hero_subtitle);
  const hero_btn_text = firstText(payload.hero_btn_text) || 'Solicitar Orçamento';
  const hero_btn_link = firstText(payload.hero_btn_link) || '/formulario';
  const hero_image_url = firstText(payload.hero_image_url);
  const hero_carousel_category_slug = payload.hero_carousel_category_slug || null;
  const about_title = firstText(payload.about_title) || 'A Mayclick Photography';
  const about_image_url = firstText(payload.about_image_url);
  const about_video_url = firstText(payload.about_video_url);
  const about_parallax_image_url = firstText(payload.about_parallax_image_url);
  const about_button_text = firstText(payload.about_button_text) || 'Saiba Mais';
  const about_button_link = firstText(payload.about_button_link) || '/sobre';
  const stat_stories = firstText(payload.stat_stories) || '+3.000';
  const stat_events = firstText(payload.stat_events) || '+500';
  const stat_clients = firstText(payload.stat_clients) || 'Clientes Satisfeitos';
  const stat_experience = firstText(payload.stat_experience) || 'Profissional';
  const instagram_username = firstText(payload.instagram_username) || 'mayclick';
  const instagram_widget_code = firstText(payload.instagram_widget_code);
  const seo_title = firstText(payload.seo_title);
  const seo_description = firstText(payload.seo_description);
  const seo_keywords = firstText(payload.seo_keywords);
  const seo_og_image = firstText(payload.seo_og_image);
  
  // Customization fields
  const color_primary = firstText(payload.color_primary) || '#1A1A1A';
  const color_accent = firstText(payload.color_accent) || '#B38E5D';
  const font_heading = firstText(payload.font_heading) || 'Outfit';
  const font_body = firstText(payload.font_body) || 'Inter';

  const about_page_hero_image = firstText(payload.about_page_hero_image);
  const about_page_text = firstText(payload.about_page_text);
  const about_page_gallery_1 = firstText(payload.about_page_gallery_1);
  const about_page_gallery_2 = firstText(payload.about_page_gallery_2);
  const about_page_gallery_3 = firstText(payload.about_page_gallery_3);

  const homepage_layout = payload.homepage_layout ? JSON.stringify(payload.homepage_layout) : null;

  try {
    const check = await pool.query('SELECT id FROM business_settings LIMIT 1');

    let result;
    if (check.rows.length === 0) {
      result = await pool.query(
        `INSERT INTO business_settings
        (company_name, trade_name, cnpj, phone, email, site, instagram, address,
         budget_validity_days, payment_terms, contract_text, institutional_text,
         whatsapp, website, pdf_validity, pdf_footer,
         hero_title, hero_subtitle, hero_btn_text, hero_btn_link, hero_image_url, hero_carousel_category_slug, hero_active,
         about_title, about_image_url, about_video_url, about_parallax_image_url, about_button_text, about_button_link,
         stat_stories, stat_events, stat_clients, stat_experience,
         instagram_username, instagram_active, instagram_widget_code, seo_title, seo_description, seo_keywords, seo_og_image,
         color_primary, color_accent, font_heading, font_body,
         about_page_hero_image, about_page_text, about_page_gallery_1, about_page_gallery_2, about_page_gallery_3,
         homepage_layout, portfolio_active, highlights_active, about_active, testimonials_active, cta_active,
         portfolio_eyebrow, portfolio_title, portfolio_description, testimonials_eyebrow, testimonials_title, cta_title, cta_text, cta_button_text,
         instagram_eyebrow, instagram_title, instagram_description)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, 5), $10, $11, $12, $13, $14, $15, $16,
                $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, $48, $49, $50, $51, $52, $53, $54, $55, $56, $57, $58, $59, $60, $61, $62, $63, $64, $65, $66)
        RETURNING *`,
        [
          company_name,
          trade_name,
          cnpj,
          phone,
          email,
          site,
          instagram,
          address,
          budget_validity_days,
          payment_terms,
          contract_text,
          institutional_text,
          whatsapp,
          website,
          pdf_validity,
          pdf_footer,
          hero_title,
          hero_subtitle,
          hero_btn_text,
          hero_btn_link,
          hero_image_url,
          hero_carousel_category_slug,
          hero_active,
          about_title,
          about_image_url,
          about_video_url,
          about_parallax_image_url,
          about_button_text,
          about_button_link,
          stat_stories,
          stat_events,
          stat_clients,
          stat_experience,
          instagram_username,
          instagram_active,
          instagram_widget_code,
          seo_title,
          seo_description,
          seo_keywords,
          seo_og_image,
          color_primary,
          color_accent,
          font_heading,
          font_body,
          about_page_hero_image,
          about_page_text,
          about_page_gallery_1,
          about_page_gallery_2,
          about_page_gallery_3,
          homepage_layout,
          portfolio_active,
          highlights_active,
          about_active,
          testimonials_active,
          cta_active,
          portfolio_eyebrow,
          portfolio_title,
          portfolio_description,
          testimonials_eyebrow,
          testimonials_title,
          cta_title,
          cta_text,
          cta_button_text,
          instagram_eyebrow,
          instagram_title,
          instagram_description
        ]
      );
    } else {
      result = await pool.query(
        `UPDATE business_settings SET
        company_name = $1,
        trade_name = $2,
        cnpj = $3,
        phone = $4,
        email = $5,
        site = $6,
        instagram = $7,
        address = $8,
        budget_validity_days = COALESCE($9, budget_validity_days),
        payment_terms = $10,
        contract_text = $11,
        institutional_text = $12,
        whatsapp = $13,
        website = $14,
        pdf_validity = $15,
        pdf_footer = $16,
        hero_title = $17,
        hero_subtitle = $18,
        hero_btn_text = $19,
        hero_btn_link = $20,
        hero_image_url = $21,
        hero_carousel_category_slug = $22,
        hero_active = $23,
        about_title = $24,
        about_image_url = $25,
        about_video_url = $26,
        stat_stories = $27,
        stat_events = $28,
        stat_clients = $29,
        stat_experience = $30,
        instagram_username = $31,
        instagram_active = $32,
        instagram_widget_code = $33,
        seo_title = $34,
        seo_description = $35,
        seo_keywords = $36,
        seo_og_image = $37,
        color_primary = $38,
        color_accent = $39,
        font_heading = $40,
        font_body = $41,
        about_parallax_image_url = $42,
        about_button_text = $43,
        about_button_link = $44,
        about_page_hero_image = $45,
        about_page_text = $46,
        about_page_gallery_1 = $47,
        about_page_gallery_2 = $48,
        about_page_gallery_3 = $49,
        homepage_layout = $50,
        portfolio_active = $51,
        highlights_active = $52,
        about_active = $53,
        testimonials_active = $54,
        cta_active = $55,
        portfolio_eyebrow = $56,
        portfolio_title = $57,
        portfolio_description = $58,
        testimonials_eyebrow = $59,
        testimonials_title = $60,
        cta_title = $61,
        cta_text = $62,
        cta_button_text = $63,
        instagram_eyebrow = $64,
        instagram_title = $65,
        instagram_description = $66,
        updated_at = CURRENT_TIMESTAMP
        WHERE id = $67 RETURNING *`,
        [
          company_name,
          trade_name,
          cnpj,
          phone,
          email,
          site,
          instagram,
          address,
          budget_validity_days,
          payment_terms,
          contract_text,
          institutional_text,
          whatsapp,
          website,
          pdf_validity,
          pdf_footer,
          hero_title,
          hero_subtitle,
          hero_btn_text,
          hero_btn_link,
          hero_image_url,
          hero_carousel_category_slug,
          hero_active,
          about_title,
          about_image_url,
          about_video_url,
          stat_stories,
          stat_events,
          stat_clients,
          stat_experience,
          instagram_username,
          instagram_active,
          instagram_widget_code,
          seo_title,
          seo_description,
          seo_keywords,
          seo_og_image,
          color_primary,
          color_accent,
          font_heading,
          font_body,
          about_parallax_image_url,
          about_button_text,
          about_button_link,
          about_page_hero_image,
          about_page_text,
          about_page_gallery_1,
          about_page_gallery_2,
          about_page_gallery_3,
          homepage_layout,
          portfolio_active,
          highlights_active,
          about_active,
          testimonials_active,
          cta_active,
          portfolio_eyebrow,
          portfolio_title,
          portfolio_description,
          testimonials_eyebrow,
          testimonials_title,
          cta_title,
          cta_text,
          cta_button_text,
          instagram_eyebrow,
          instagram_title,
          instagram_description,
          check.rows[0].id,
        ]
      );
    }

    res.json(mapSettings(result.rows[0]));
  } catch (error) {
    console.error('Error updating settings:', sanitizeError(error));
    res.status(500).json({ message: 'Internal server error.' });
  }
};
