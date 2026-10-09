/* @ds-bundle: {"format":4,"namespace":"RelwickDesignSystem_7a933f","components":[{"name":"Button","sourcePath":"components/actions/Button.jsx"},{"name":"Icon","sourcePath":"components/actions/Icon.jsx"},{"name":"IconButton","sourcePath":"components/actions/IconButton.jsx"},{"name":"Badge","sourcePath":"components/display/Badge.jsx"},{"name":"Card","sourcePath":"components/display/Card.jsx"},{"name":"Tag","sourcePath":"components/display/Tag.jsx"},{"name":"Dialog","sourcePath":"components/feedback/Dialog.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Tooltip","sourcePath":"components/feedback/Tooltip.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Radio","sourcePath":"components/forms/Radio.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"}],"sourceHashes":{"components/actions/Button.jsx":"a44892d7a37c","components/actions/Icon.jsx":"44b5ad99f803","components/actions/IconButton.jsx":"3178c5d39f74","components/display/Badge.jsx":"c55c69f98981","components/display/Card.jsx":"a433740d9359","components/display/Tag.jsx":"79d5f16fc944","components/feedback/Dialog.jsx":"54d5aa9e48f0","components/feedback/Toast.jsx":"ca871711f944","components/feedback/Tooltip.jsx":"1e0acdb03426","components/forms/Checkbox.jsx":"bc7336f2f408","components/forms/Input.jsx":"46f9c0b6d993","components/forms/Radio.jsx":"fba8e626e609","components/forms/Select.jsx":"c98d782c9d6a","components/forms/Switch.jsx":"5a5cb71b3577","components/navigation/Tabs.jsx":"6557f62824c8","ui_kits/website/Contact.jsx":"8cec476ffa48","ui_kits/website/Pages.jsx":"8b696e4348b4","ui_kits/website/Shell.jsx":"38f1fc14e292"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.RelwickDesignSystem_7a933f = window.RelwickDesignSystem_7a933f || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/actions/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Icon({
  name,
  size = 20,
  style,
  className = '',
  ...rest
}) {
  const src = 'url(https://unpkg.com/lucide-static@0.460.0/icons/' + name + '.svg)';
  return /*#__PURE__*/React.createElement("span", _extends({
    "aria-hidden": "true",
    className: 'rw-icon ' + className,
    style: {
      width: size,
      height: size,
      '--src': src,
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/Icon.jsx", error: String((e && e.message) || e) }); }

// components/actions/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const cx = (...a) => a.filter(Boolean).join(' ');
function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  arrow = false,
  href,
  className,
  children,
  ...rest
}) {
  const cls = cx('rw-btn', 'rw-btn--' + variant, size !== 'md' && 'rw-btn--' + size, className);
  const s = size === 'sm' ? 16 : 18;
  const inner = /*#__PURE__*/React.createElement(React.Fragment, null, icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: s
  }), children, iconRight && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconRight,
    size: s
  }), arrow && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "arrow-right",
    size: s,
    className: "rw-btn__arrow"
  }));
  return href ? /*#__PURE__*/React.createElement("a", _extends({
    href: href,
    className: cls
  }, rest), inner) : /*#__PURE__*/React.createElement("button", _extends({
    className: cls
  }, rest), inner);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/Button.jsx", error: String((e && e.message) || e) }); }

// components/actions/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const cx = (...a) => a.filter(Boolean).join(' ');
function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  className,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("button", _extends({
    "aria-label": label,
    title: label,
    className: cx('rw-btn', 'rw-btn--icon', 'rw-btn--' + variant, size !== 'md' && 'rw-btn--' + size, className)
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: size === 'sm' ? 16 : 20
  }));
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/display/Badge.jsx
try { (() => {
const T = {
  neutral: ['var(--rw-surface-sunken)', 'var(--rw-text-muted)'],
  primary: ['var(--rw-primary-soft)', 'var(--rw-primary-soft-text)'],
  success: ['var(--rw-success-soft)', 'var(--rw-success)'],
  warning: ['var(--rw-warning-soft)', 'var(--rw-warning)'],
  danger: ['var(--rw-danger-soft)', 'var(--rw-danger)'],
  copper: ['var(--rw-copper-soft)', 'var(--rw-copper-text)']
};
function Badge({
  tone = 'neutral',
  dot = false,
  children,
  style
}) {
  const [bg, fg] = T[tone] || T.neutral;
  return /*#__PURE__*/React.createElement("span", {
    className: "rw-badge",
    style: {
      background: bg,
      color: fg,
      ...style
    }
  }, dot && /*#__PURE__*/React.createElement("i", {
    className: "rw-badge__dot"
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Badge.jsx", error: String((e && e.message) || e) }); }

// components/display/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const cx = (...a) => a.filter(Boolean).join(' ');
function Card({
  variant = 'default',
  interactive = false,
  className,
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cx('rw-card', variant !== 'default' && 'rw-card--' + variant, interactive && 'rw-card--interactive', className)
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Card.jsx", error: String((e && e.message) || e) }); }

// components/display/Tag.jsx
try { (() => {
const cx = (...a) => a.filter(Boolean).join(' ');
function Tag({
  tone = 'primary',
  selected,
  onToggle,
  onRemove,
  children
}) {
  if (onToggle) return /*#__PURE__*/React.createElement("button", {
    className: "rw-tag rw-tag--selectable",
    "aria-pressed": !!selected,
    onClick: onToggle
  }, children);
  return /*#__PURE__*/React.createElement("span", {
    className: cx('rw-tag', tone === 'neutral' && 'rw-tag--neutral')
  }, children, onRemove && /*#__PURE__*/React.createElement("button", {
    className: "rw-tag__x",
    "aria-label": "Retirer",
    onClick: onRemove
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x",
    size: 12
  })));
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Tag.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Dialog.jsx
try { (() => {
function Dialog({
  open,
  title,
  children,
  actions,
  onClose
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "rw-overlay",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "rw-dialog",
    role: "dialog",
    "aria-modal": "true",
    onClick: e => e.stopPropagation()
  }, title && /*#__PURE__*/React.createElement("h2", {
    className: "rw-dialog__title"
  }, title), /*#__PURE__*/React.createElement("div", {
    className: "rw-dialog__body"
  }, children), actions && /*#__PURE__*/React.createElement("div", {
    className: "rw-dialog__actions"
  }, actions)));
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
const IC = {
  success: ['circle-check', 'var(--malachite-400)'],
  info: ['info', 'var(--indigo-400)'],
  warning: ['triangle-alert', 'var(--amber-400)'],
  danger: ['circle-x', 'var(--red-400)']
};
function Toast({
  tone = 'success',
  title,
  description,
  style
}) {
  const [n, c] = IC[tone] || IC.info;
  return /*#__PURE__*/React.createElement("div", {
    className: "rw-toast",
    role: "status",
    style: style
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: n,
    size: 20,
    style: {
      color: c,
      marginTop: 1
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "rw-toast__title"
  }, title), description && /*#__PURE__*/React.createElement("div", {
    className: "rw-toast__desc"
  }, description)));
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tooltip.jsx
try { (() => {
function Tooltip({
  label,
  placement = 'top',
  children
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: 'rw-tip' + (placement === 'bottom' ? ' rw-tip--bottom' : '')
  }, children, /*#__PURE__*/React.createElement("span", {
    role: "tooltip",
    className: "rw-tip__bubble"
  }, label));
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Checkbox({
  label,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    className: "rw-check"
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox"
  }, rest)), /*#__PURE__*/React.createElement("span", {
    className: "rw-check__box"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 12 12",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2.5 6.2 5 8.5l4.5-5",
    stroke: "#fff",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), label && /*#__PURE__*/React.createElement("span", null, label));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Input({
  label,
  hint,
  error,
  multiline = false,
  id,
  ...rest
}) {
  const fid = id || (label ? 'f-' + label.replace(/\W+/g, '-').toLowerCase() : undefined);
  const T = multiline ? 'textarea' : 'input';
  return /*#__PURE__*/React.createElement("label", {
    className: "rw-field",
    htmlFor: fid
  }, label && /*#__PURE__*/React.createElement("span", {
    className: "rw-field__label"
  }, label), /*#__PURE__*/React.createElement(T, _extends({
    id: fid,
    className: "rw-input",
    "aria-invalid": !!error
  }, rest)), (error || hint) && /*#__PURE__*/React.createElement("span", {
    className: 'rw-field__hint' + (error ? ' rw-field__hint--error' : '')
  }, error || hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Radio.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Radio({
  label,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    className: "rw-check rw-check--radio"
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "radio"
  }, rest)), /*#__PURE__*/React.createElement("span", {
    className: "rw-check__box"
  }), label && /*#__PURE__*/React.createElement("span", null, label));
}
Object.assign(__ds_scope, { Radio });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Radio.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Select({
  label,
  hint,
  options = [],
  id,
  ...rest
}) {
  const fid = id || (label ? 's-' + label.replace(/\W+/g, '-').toLowerCase() : undefined);
  return /*#__PURE__*/React.createElement("label", {
    className: "rw-field",
    htmlFor: fid
  }, label && /*#__PURE__*/React.createElement("span", {
    className: "rw-field__label"
  }, label), /*#__PURE__*/React.createElement("select", _extends({
    id: fid,
    className: "rw-input rw-select"
  }, rest), options.map(o => typeof o === 'string' ? /*#__PURE__*/React.createElement("option", {
    key: o
  }, o) : /*#__PURE__*/React.createElement("option", {
    key: o.value,
    value: o.value
  }, o.label))), hint && /*#__PURE__*/React.createElement("span", {
    className: "rw-field__hint"
  }, hint));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Switch({
  label,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    className: "rw-check"
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox",
    role: "switch"
  }, rest)), /*#__PURE__*/React.createElement("span", {
    className: "rw-switch__track"
  }), label && /*#__PURE__*/React.createElement("span", null, label));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
function Tabs({
  items = [],
  value,
  onChange,
  variant = 'underline'
}) {
  const [cur, setCur] = React.useState(value ?? items[0]?.value);
  const v = value ?? cur;
  const refs = React.useRef({});
  const [ink, setInk] = React.useState({
    left: 0,
    width: 0
  });
  React.useLayoutEffect(() => {
    const el = refs.current[v];
    if (el) setInk({
      left: el.offsetLeft,
      width: el.offsetWidth
    });
  }, [v, items.length]);
  return /*#__PURE__*/React.createElement("div", {
    className: 'rw-tabs' + (variant === 'pill' ? ' rw-tabs--pill' : ''),
    role: "tablist"
  }, /*#__PURE__*/React.createElement("span", {
    className: "rw-tabs__ink",
    style: ink
  }), items.map(it => /*#__PURE__*/React.createElement("button", {
    key: it.value,
    ref: e => refs.current[it.value] = e,
    role: "tab",
    "aria-selected": it.value === v,
    className: "rw-tab",
    onClick: () => {
      setCur(it.value);
      onChange && onChange(it.value);
    }
  }, it.label)));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Contact.jsx
try { (() => {
const {
  Button: CButton,
  Input: CInput,
  Select: CSelect,
  Checkbox: CCheckbox,
  Radio: CRadio,
  Dialog: CDialog,
  Toast: CToast,
  Icon: CIcon
} = window.RelwickDesignSystem_7a933f;
function ContactPage() {
  const [confirm, setConfirm] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [err, setErr] = React.useState('');
  const submit = e => {
    e.preventDefault();
    const em = e.target.email.value;
    if (!/.+@.+\..+/.test(em)) {
      setErr('Adresse e-mail incomplète');
      return;
    }
    setErr('');
    setConfirm(true);
  };
  return /*#__PURE__*/React.createElement("section", {
    className: "wrap pghead contact"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow rv"
  }, "Contact"), /*#__PURE__*/React.createElement("h1", {
    className: "h1 rv"
  }, "Parlez-nous de votre projet."), /*#__PURE__*/React.createElement("p", {
    className: "lead muted rv"
  }, "Nous revenons vers vous sous 48 h avec une estimation claire."), /*#__PURE__*/React.createElement("ul", {
    className: "clist rv"
  }, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement(CIcon, {
    name: "mail",
    size: 20
  }), "bonjour@relwick.fr"), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement(CIcon, {
    name: "clock",
    size: 20
  }), "Lun \u2013 ven, 9 h \u2013 18 h"))), /*#__PURE__*/React.createElement("form", {
    className: "form rw-card rv",
    onSubmit: submit,
    noValidate: true
  }, /*#__PURE__*/React.createElement("div", {
    className: "form__2"
  }, /*#__PURE__*/React.createElement(CInput, {
    label: "Nom complet",
    name: "nom",
    placeholder: "Camille Durand"
  }), /*#__PURE__*/React.createElement(CInput, {
    label: "Adresse e-mail",
    name: "email",
    placeholder: "vous@exemple.fr",
    error: err
  })), /*#__PURE__*/React.createElement(CSelect, {
    label: "Type de projet",
    options: ['Site vitrine', 'Boutique en ligne', 'Application Android & iOS', 'Logiciel PC', 'Autre']
  }), /*#__PURE__*/React.createElement("fieldset", {
    className: "fs"
  }, /*#__PURE__*/React.createElement("legend", {
    className: "rw-field__label"
  }, "Budget estim\xE9"), /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      gap: 20
    }
  }, /*#__PURE__*/React.createElement(CRadio, {
    name: "b",
    label: "Moins de 2 000 \u20AC"
  }), /*#__PURE__*/React.createElement(CRadio, {
    name: "b",
    label: "2 000 \u2013 10 000 \u20AC",
    defaultChecked: true
  }), /*#__PURE__*/React.createElement(CRadio, {
    name: "b",
    label: "Plus de 10 000 \u20AC"
  }))), /*#__PURE__*/React.createElement(CInput, {
    label: "Votre projet",
    multiline: true,
    rows: 4,
    placeholder: "D\xE9crivez votre besoin en quelques lignes."
  }), /*#__PURE__*/React.createElement(CCheckbox, {
    label: "J'accepte d'\xEAtre recontact\xE9 au sujet de ma demande.",
    defaultChecked: true
  }), /*#__PURE__*/React.createElement(CButton, {
    type: "submit",
    size: "lg",
    arrow: true
  }, "Envoyer la demande")), /*#__PURE__*/React.createElement(CDialog, {
    open: confirm,
    title: "Envoyer la demande ?",
    onClose: () => setConfirm(false),
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(CButton, {
      variant: "ghost",
      onClick: () => setConfirm(false)
    }, "Annuler"), /*#__PURE__*/React.createElement(CButton, {
      onClick: () => {
        setConfirm(false);
        setSent(true);
        setTimeout(() => setSent(false), 4000);
      }
    }, "Envoyer"))
  }, "Votre demande sera transmise \xE0 notre \xE9quipe. Vous recevrez une copie par e-mail."), sent && /*#__PURE__*/React.createElement("div", {
    className: "toasts"
  }, /*#__PURE__*/React.createElement(CToast, {
    title: "Demande envoy\xE9e",
    description: "Nous revenons vers vous sous 48 h."
  })));
}
Object.assign(window, {
  ContactPage
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Contact.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Pages.jsx
try { (() => {
const {
  Button: HButton,
  Icon: HIcon,
  Card: HCard,
  Badge: HBadge,
  Tag: HTag,
  Tabs: HTabs
} = window.RelwickDesignSystem_7a933f;
const SERVICES = [{
  icon: 'monitor',
  t: 'Sites web',
  d: 'Sites vitrines, boutiques en ligne et plateformes sur mesure, rapides et faciles à mettre à jour.',
  tags: ['Next.js', 'WordPress', 'Shopify']
}, {
  icon: 'smartphone',
  t: 'Applications Android & iOS',
  d: 'Une seule base de code, publiée sur le Play Store et l\u2019App Store.',
  tags: ['Flutter', 'React Native']
}, {
  icon: 'laptop',
  t: 'Logiciels PC',
  d: 'Outils de gestion et applications de bureau pour Windows, macOS et Linux.',
  tags: ['Electron', 'Flutter Desktop']
}];
const STEPS = [['Échange', 'Un appel de 30 minutes pour comprendre votre besoin.'], ['Maquette', 'Vous validez les écrans avant la première ligne de code.'], ['Développement', 'Une version de test chaque semaine, sur votre téléphone.'], ['Mise en ligne', 'Publication, formation et suivi après lancement.']];
const WORK = [{
  cat: 'web',
  t: 'Boulangerie Martin',
  k: 'Site vitrine + commande en ligne',
  tone: 'var(--indigo-100)'
}, {
  cat: 'mobile',
  t: 'FitPulse',
  k: 'Application Android & iOS',
  tone: 'var(--copper-100)'
}, {
  cat: 'pc',
  t: 'Stockly',
  k: 'Logiciel de gestion de stock',
  tone: 'var(--ink-100)'
}, {
  cat: 'web',
  t: 'Cabinet Lemaire',
  k: 'Site d\u2019avocats, prise de rendez-vous',
  tone: 'var(--malachite-100)'
}, {
  cat: 'mobile',
  t: 'Trajet+',
  k: 'Application de covoiturage local',
  tone: 'var(--indigo-200)'
}, {
  cat: 'web',
  t: 'Atelier Noé',
  k: 'Boutique en ligne',
  tone: 'var(--copper-200)'
}];
function Hero({
  go
}) {
  const words = ['Votre', 'site,', 'vos', 'applications.'];
  return /*#__PURE__*/React.createElement("section", {
    className: "hero wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero__txt"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow rv"
  }, "Agence web & mobile"), /*#__PURE__*/React.createElement("h1", {
    className: "display"
  }, words.map((w, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    className: "word"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      animationDelay: 120 + i * 90 + 'ms'
    }
  }, w))), /*#__PURE__*/React.createElement("span", {
    className: "word"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ac",
    style: {
      animationDelay: '520ms'
    }
  }, "Bien faits."))), /*#__PURE__*/React.createElement("p", {
    className: "lead rv",
    style: {
      transitionDelay: '500ms'
    }
  }, "Nous cr\xE9ons des sites web et des applications Android, iOS et PC pour les particuliers et les entreprises. Un seul interlocuteur, de la maquette \xE0 la mise en ligne."), /*#__PURE__*/React.createElement("div", {
    className: "row rv",
    style: {
      transitionDelay: '620ms'
    }
  }, /*#__PURE__*/React.createElement(HButton, {
    size: "lg",
    arrow: true,
    onClick: () => go('contact')
  }, "Demander un devis"), /*#__PURE__*/React.createElement(HButton, {
    size: "lg",
    variant: "secondary",
    onClick: () => go('realisations')
  }, "Voir nos r\xE9alisations"))), /*#__PURE__*/React.createElement("div", {
    className: "hero__art",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tile t1"
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "monitor",
    size: 28
  }), /*#__PURE__*/React.createElement("span", null, "Web")), /*#__PURE__*/React.createElement("div", {
    className: "tile t2"
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "smartphone",
    size: 28
  }), /*#__PURE__*/React.createElement("span", null, "Android")), /*#__PURE__*/React.createElement("div", {
    className: "tile t3"
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "apple",
    size: 28
  }), /*#__PURE__*/React.createElement("span", null, "iOS")), /*#__PURE__*/React.createElement("div", {
    className: "tile t4"
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "laptop",
    size: 28
  }), /*#__PURE__*/React.createElement("span", null, "PC"))));
}
function Marquee() {
  const items = ['Flutter', 'Next.js', 'React Native', 'WordPress', 'Shopify', 'Firebase', 'Node.js', 'Electron', 'Figma', 'Stripe'];
  return /*#__PURE__*/React.createElement("div", {
    className: "mq",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mq__in"
  }, [...items, ...items].map((t, i) => /*#__PURE__*/React.createElement("span", {
    key: i
  }, t, /*#__PURE__*/React.createElement("i", null)))));
}
function Services({
  full
}) {
  return /*#__PURE__*/React.createElement("section", {
    className: "sec wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sec__head rv"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Services"), /*#__PURE__*/React.createElement("h2", {
    className: "h2"
  }, "Trois m\xE9tiers, une m\xEAme exigence.")), /*#__PURE__*/React.createElement("div", {
    className: "grid3"
  }, SERVICES.map((s, i) => /*#__PURE__*/React.createElement(HCard, {
    key: s.t,
    interactive: true,
    className: "rv svc",
    style: {
      transitionDelay: i * 90 + 'ms'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "svc__ic"
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: s.icon,
    size: 24
  })), /*#__PURE__*/React.createElement("h3", {
    className: "h3"
  }, s.t), /*#__PURE__*/React.createElement("p", {
    className: "muted"
  }, s.d), full && /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      gap: 6,
      marginTop: 'auto'
    }
  }, s.tags.map(t => /*#__PURE__*/React.createElement(HTag, {
    key: t,
    tone: "neutral"
  }, t)))))));
}
function Process() {
  return /*#__PURE__*/React.createElement("section", {
    className: "sec wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sec__head rv"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "M\xE9thode"), /*#__PURE__*/React.createElement("h2", {
    className: "h2"
  }, "Comment nous travaillons.")), /*#__PURE__*/React.createElement("ol", {
    className: "steps"
  }, STEPS.map(([t, d], i) => /*#__PURE__*/React.createElement("li", {
    key: t,
    className: "rv",
    style: {
      transitionDelay: i * 110 + 'ms'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "steps__n"
  }, "0", i + 1), /*#__PURE__*/React.createElement("h3", {
    className: "h4"
  }, t), /*#__PURE__*/React.createElement("p", {
    className: "muted"
  }, d)))));
}
function Work({
  limit,
  filter
}) {
  const [cat, setCat] = React.useState('all');
  const list = WORK.filter(w => cat === 'all' || w.cat === cat).slice(0, limit || 99);
  return /*#__PURE__*/React.createElement("section", {
    className: "sec wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sec__head rv"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "R\xE9alisations"), /*#__PURE__*/React.createElement("h2", {
    className: "h2"
  }, "Quelques projets r\xE9cents.")), filter && /*#__PURE__*/React.createElement("div", {
    className: "rv",
    style: {
      marginBottom: 32
    }
  }, /*#__PURE__*/React.createElement(HTabs, {
    variant: "pill",
    value: cat,
    onChange: setCat,
    items: [{
      value: 'all',
      label: 'Tout'
    }, {
      value: 'web',
      label: 'Sites web'
    }, {
      value: 'mobile',
      label: 'Applications'
    }, {
      value: 'pc',
      label: 'Logiciels PC'
    }]
  })), /*#__PURE__*/React.createElement("div", {
    className: "grid3"
  }, list.map((w, i) => /*#__PURE__*/React.createElement("a", {
    key: w.t,
    className: "work rv",
    style: {
      transitionDelay: i % 3 * 90 + 'ms'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "work__img",
    style: {
      background: w.tone
    }
  }, /*#__PURE__*/React.createElement("span", null, "Visuel du projet")), /*#__PURE__*/React.createElement("div", {
    className: "work__meta"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "h4"
  }, w.t), /*#__PURE__*/React.createElement("p", {
    className: "muted small"
  }, w.k)), /*#__PURE__*/React.createElement(HIcon, {
    name: "arrow-up-right",
    size: 20,
    className: "work__go"
  }))))));
}
function CTA({
  go
}) {
  return /*#__PURE__*/React.createElement("section", {
    className: "wrap",
    style: {
      paddingBottom: 96
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "cta rw-leaf rv",
    "data-theme": "dark"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "h2"
  }, "Un projet en t\xEAte ?"), /*#__PURE__*/React.createElement("p", {
    className: "lead muted",
    style: {
      margin: '12px 0 0'
    }
  }, "Devis gratuit, r\xE9ponse sous 48 h.")), /*#__PURE__*/React.createElement(HButton, {
    size: "lg",
    arrow: true,
    onClick: () => go('contact')
  }, "Parlons-en")));
}
function HomePage({
  go
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Hero, {
    go: go
  }), /*#__PURE__*/React.createElement(Marquee, null), /*#__PURE__*/React.createElement(Services, null), /*#__PURE__*/React.createElement(Process, null), /*#__PURE__*/React.createElement(Work, {
    limit: 3
  }), /*#__PURE__*/React.createElement(CTA, {
    go: go
  }));
}
function ServicesPage({
  go
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("section", {
    className: "wrap pghead"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow rv"
  }, "Services"), /*#__PURE__*/React.createElement("h1", {
    className: "h1 rv"
  }, "Du site vitrine \xE0 l'application sur mesure.")), /*#__PURE__*/React.createElement(Services, {
    full: true
  }), /*#__PURE__*/React.createElement(Process, null), /*#__PURE__*/React.createElement(CTA, {
    go: go
  }));
}
function WorkPage({
  go
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("section", {
    className: "wrap pghead"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow rv"
  }, "R\xE9alisations"), /*#__PURE__*/React.createElement("h1", {
    className: "h1 rv"
  }, "Ce que nous avons construit.")), /*#__PURE__*/React.createElement(Work, {
    filter: true
  }), /*#__PURE__*/React.createElement(CTA, {
    go: go
  }));
}
Object.assign(window, {
  HomePage,
  ServicesPage,
  WorkPage
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Pages.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Shell.jsx
try { (() => {
const DS = window.RelwickDesignSystem_7a933f;
const {
  Button,
  IconButton,
  Icon
} = DS;
function useReveal() {
  React.useEffect(() => {
    const els = document.querySelectorAll('.rv:not(.in)');
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    }), {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  });
}
function Header({
  page,
  go,
  theme,
  setTheme
}) {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    const f = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', f);
    return () => window.removeEventListener('scroll', f);
  }, []);
  const links = [['accueil', 'Accueil'], ['services', 'Services'], ['realisations', 'Réalisations'], ['contact', 'Contact']];
  return /*#__PURE__*/React.createElement("header", {
    className: 'hd' + (scrolled ? ' hd--s' : '')
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap hd__in"
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      go('accueil');
    },
    className: "hd__logo",
    "aria-label": "relwick \u2014 accueil"
  }, /*#__PURE__*/React.createElement("img", {
    src: theme === 'dark' ? '../../assets/logo/relwick-logo-on-dark.svg' : '../../assets/logo/relwick-logo.svg',
    alt: "relwick"
  })), /*#__PURE__*/React.createElement("nav", {
    className: 'hd__nav' + (open ? ' open' : '')
  }, links.map(([k, l]) => /*#__PURE__*/React.createElement("a", {
    key: k,
    href: "#",
    className: page === k ? 'on' : '',
    onClick: e => {
      e.preventDefault();
      setOpen(false);
      go(k);
    }
  }, l))), /*#__PURE__*/React.createElement("div", {
    className: "hd__act"
  }, /*#__PURE__*/React.createElement(IconButton, {
    icon: theme === 'dark' ? 'sun' : 'moon',
    label: "Changer de th\xE8me",
    onClick: () => setTheme(theme === 'dark' ? 'light' : 'dark')
  }), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    arrow: true,
    onClick: () => go('contact'),
    className: "hd__cta"
  }, "Demander un devis"), /*#__PURE__*/React.createElement(IconButton, {
    icon: open ? 'x' : 'menu',
    label: "Menu",
    className: "hd__burger",
    onClick: () => setOpen(!open)
  }))));
}
function Footer({
  go,
  theme
}) {
  return /*#__PURE__*/React.createElement("footer", {
    className: "ft",
    "data-theme": "dark"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ft__top"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 360
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo/relwick-logo-on-dark.svg",
    alt: "relwick",
    style: {
      height: 32
    }
  }), /*#__PURE__*/React.createElement("p", {
    className: "muted",
    style: {
      marginTop: 16
    }
  }, "Agence de cr\xE9ation de sites web et d'applications Android, iOS et PC, pour les particuliers et les entreprises.")), /*#__PURE__*/React.createElement("div", {
    className: "ft__cols"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", null, "Services"), /*#__PURE__*/React.createElement("a", {
    onClick: () => go('services')
  }, "Sites web"), /*#__PURE__*/React.createElement("a", {
    onClick: () => go('services')
  }, "Applications mobiles"), /*#__PURE__*/React.createElement("a", {
    onClick: () => go('services')
  }, "Logiciels PC")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", null, "Agence"), /*#__PURE__*/React.createElement("a", {
    onClick: () => go('realisations')
  }, "R\xE9alisations"), /*#__PURE__*/React.createElement("a", {
    onClick: () => go('contact')
  }, "Contact")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", null, "Contact"), /*#__PURE__*/React.createElement("a", null, "bonjour@relwick.fr")))), /*#__PURE__*/React.createElement("div", {
    className: "ft__bot muted"
  }, /*#__PURE__*/React.createElement("span", null, "\xA9 2026 Relwick"), /*#__PURE__*/React.createElement("span", null, "Mentions l\xE9gales \xB7 Confidentialit\xE9"))));
}
Object.assign(window, {
  useReveal,
  Header,
  Footer
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Shell.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Tabs = __ds_scope.Tabs;

})();
