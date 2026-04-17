const API_URL = "https://script.google.com/macros/s/AKfycbzCMY46Pg2NywlrIsikF7EcyGfmofgq0H3sDBLkvc6xyZ6OZM6Ti_jJ3Y8ex9lCiGRQ/exec";

function setLoading(isLoading) {
  document.getElementById('loadingText').style.display = isLoading ? 'block' : 'none';
}

function createOptions(selectId, items) {
  const select = document.getElementById(selectId);
  select.innerHTML = '<option value="">-- กรุณาเลือก --</option>';
  (items || []).forEach(item => {
    const opt = document.createElement('option');
    opt.value = item;
    opt.textContent = item;
    select.appendChild(opt);
  });
}

function createCheckboxGroup(containerId, items) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  (items || []).forEach(item => {
    const div = document.createElement('label');
    div.className = 'check-item';
    div.innerHTML = `<input type="checkbox" value="${escapeHtml(item)}"> <span>${escapeHtml(item)}</span>`;
    container.appendChild(div);
  });
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getCheckedValues(containerId) {
  return Array.from(document.querySelectorAll(`#${containerId} input[type="checkbox"]:checked`))
    .map(el => el.value);
}

function parseNumber(value) {
  return String(value || '').replace(/,/g, '').trim();
}

function attachNumberFormatter(id) {
  const el = document.getElementById(id);
  if (!el) return;

  el.addEventListener('input', function () {
    const raw = this.value.replace(/[^\d]/g, '');
    this.value = raw ? Number(raw).toLocaleString('en-US') : '';
  });

  el.addEventListener('blur', function () {
    const raw = this.value.replace(/[^\d]/g, '');
    this.value = raw ? Number(raw).toLocaleString('en-US') : '';
  });
}

function getFormData() {
  return {
    customer_name: document.getElementById('customer_name').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    age: document.getElementById('age').value,
    occupation: document.getElementById('occupation').value.trim(),
    income: parseNumber(document.getElementById('income').value),
    budget: parseNumber(document.getElementById('budget').value),
    authority: document.getElementById('authority').value,
    need: getCheckedValues('need_group'),
    horizon: document.getElementById('horizon').value,
    attitude: document.getElementById('attitude').value,
    risk: getCheckedValues('risk_group'),
    action: document.getElementById('action').value
  };
}

function renderResult(result) {
  document.getElementById('productName').textContent = 'ผลิตภัณฑ์ที่แนะนำ: ' + (result.recommended_product || '-');
  document.getElementById('confidence').textContent = result.confidence || '-';
  document.getElementById('reason').textContent = result.reason || '-';
  document.getElementById('scoreW103').textContent = result.score_w103 ?? 0;
  document.getElementById('scoreW155').textContent = result.score_w155 ?? 0;
  document.getElementById('scoreH902').textContent = result.score_h902 ?? 0;

  const alts = (result.alternatives || []).map(item => `${item.product_name} (${item.score} คะแนน)`).join(' | ');
  document.getElementById('alternatives').textContent = alts || '-';
  document.getElementById('resultBox').style.display = 'block';
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.json();
}

async function loadDropdownData() {
  return await fetchJson(`${API_URL}?action=getDropdownData`);
}

async function previewResultRequest(formData) {
  const params = new URLSearchParams({
    action: 'preview',
    customer_name: formData.customer_name || '',
    phone: formData.phone || '',
    age: formData.age || '',
    occupation: formData.occupation || '',
    income: formData.income || '',
    budget: formData.budget || '',
    authority: formData.authority || '',
    need: (formData.need || []).join(','),
    horizon: formData.horizon || '',
    attitude: formData.attitude || '',
    risk: (formData.risk || []).join(','),
    plan_action: formData.action || ''
  });

  return await fetchJson(`${API_URL}?${params.toString()}`);
}

async function saveFormRequest(formData) {
  return await fetchJson(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(formData)
  });
}

async function previewResult() {
  try {
    setLoading(true);
    const result = await previewResultRequest(getFormData());
    if (result.error) throw new Error(result.error);
    renderResult(result);
  } catch (err) {
    alert('เกิดข้อผิดพลาด: ' + err.message);
  } finally {
    setLoading(false);
  }
}

async function saveForm() {
  try {
    setLoading(true);
    const result = await saveFormRequest(getFormData());
    if (result.error) throw new Error(result.error);
    renderResult(result);
    alert('บันทึกข้อมูลเรียบร้อยแล้ว');
  } catch (err) {
    alert('เกิดข้อผิดพลาด: ' + err.message);
  } finally {
    setLoading(false);
  }
}

async function initForm() {
  attachNumberFormatter('income');
  attachNumberFormatter('budget');

  try {
    const data = await loadDropdownData();
    createOptions('authority', data.authority || []);
    createOptions('horizon', data.horizon || []);
    createOptions('attitude', data.attitude || []);
    createOptions('action', data.action || []);
    createCheckboxGroup('need_group', data.need || []);
    createCheckboxGroup('risk_group', data.risk || []);
  } catch (err) {
    alert('โหลดข้อมูล dropdown ไม่สำเร็จ: ' + err.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('previewBtn').addEventListener('click', previewResult);
  document.getElementById('saveBtn').addEventListener('click', saveForm);
  initForm();
});
