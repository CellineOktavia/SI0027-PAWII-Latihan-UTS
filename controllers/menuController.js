// TODO B: Controller Menu - CRUD lengkap (Pertemuan 3-4, 9-12)
//
// Format error: lempar objek { status, message } (lihat middlewares/errorHandler.js),
// mis. throw { status: 404, message: "Menu tidak ditemukan" }
// express-async-errors sudah aktif di app.js, jadi tidak perlu try/catch.

const Menu = require("../models/menuModel");

const MAX_LIMIT = 100;

// GET /menu
// Query opsional:
//   kantinId  filter berdasarkan kantin
//   sort        nama field, urut ascending (default: createdAt)
//   page        default 1
//   limit       default 10, maksimum 100
//   fields      projection, dipisah koma, mis. fields=nama,kode
// Respons 200: { data, page, limit, total }
//   - total = jumlah dokumen yang cocok dengan filter (BUKAN jumlah data pada halaman ini)
//   - data memuat kantinId yang ter-populate (objek Kantin)
exports.getAll = async (req, res) => {
  // TODO B1
  let { kantinId, sort, page, limit, fields } = req.query;

  // 1. Buat filter query
  const filter = {};
  if (kantinId) {
    filter.kantinId = kantinId;
  }

  // 2. Pagination (page & limit)
  page = parseInt(page, 10) || 1;
  limit = parseInt(limit, 10) || 10;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;
  const skip = (page - 1) * limit;

  // 3. Query dasar dengan populate Kantin
  let query = Menu.find(filter).populate('kantinId');

  // 4. Sorting
  if (sort) {
    const sortBy = sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort("createdAt"); // default urut descending/ascending, sesuai ketentuan default createdAt
  }

  // 5. Field selection (Projection)
  if (fields) {
    const fieldsBy = fields.split(',').join(' ');
    query = query.select(fieldsBy);
  }

  // Terapkan pagination skip & limit
  query = query.skip(skip).limit(limit);

  // Jalankan query data dan hitung total data secara paralel
  const [data, total] = await Promise.all([query, Menu.countDocuments(filter)]);

  res.status(200).json({
    data,
    page,
    limit,
    total,
  });
};

// GET /menu/:id
//   - 200 -> dokumen menu, kantinId ter-populate
//   - tidak ada -> 404 { message }
//   - format id salah -> 400 (ditangani errorHandler lewat CastError)
exports.getById = async (req, res) => {
  // TODO B2
  const menu = await Menu.findById(req.params.id).populate('kantinId');
  if (!menu) {
    throw { status: 404, message: 'Menu tidak ditemukan' };
  }
  res.status(200).json(menu);
};

// POST /menu
//   - 201 -> dokumen yang baru dibuat
//   - validasi gagal / ISBN duplikat -> 400 (ditangani errorHandler)
exports.create = async (req, res) => {
  // TODO B3
  const newMenu = await Menu.create(req.body);
  res.status(201).json(newMenu);
};

// PUT /menu/:id
//   - 200 -> dokumen setelah diperbarui (bukan sebelum)
//   - validasi schema HARUS tetap berjalan saat update
//   - tidak ada -> 404 { message }
exports.update = async (req, res) => {
  // TODO B4
  const updatedMenu = await Menu.findByIdAndUpdate(
    req.params.id, req.body, 
    { new: true, runValidators: true }
  ).populate('kantinId');

  if (!updatedMenu) {
    throw { status: 404, message: 'Menu tidak ditemukan' };
  }
  res.status(200).json(updatedMenu);
};

// DELETE /menu/:id
//   - 204 tanpa body
//   - tidak ada -> 404 { message }
exports.remove = async (req, res) => {
  // TODO B5
  const deletedMenu = await Menu.findByIdAndDelete(req.params.id);
  if(!deletedMenu){
    throw { status: 404, message: "Menu tidak ditemukan" };
  }
  res.status(204).send();
};
