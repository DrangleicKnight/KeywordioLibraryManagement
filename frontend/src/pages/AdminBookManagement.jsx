import { useState, useEffect } from "react";
import axios from "axios";
import "./styles/AdminBookManagement.css";

const AdminBookManagement = () => {
    const [books, setBooks] = useState([]);
    const [editBook, setEditBook] = useState(null);
    const [updatedBook, setUpdatedBook] = useState({
        title: "",
        description: "",
        author_id: "",
        category_ids: [],
    });
    const [authors, setAuthors] = useState([]);
    const [categories, setCategories] = useState([]);
    const token = localStorage.getItem("adminToken");

    useEffect(() => {
        fetchBooks();
        fetchAuthorsAndCategories();
    }, []);

    const fetchBooks = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/books/");
            setBooks(res.data);
        } catch (err) {
            console.error("Error fetching books", err);
        }
    };

    const fetchAuthorsAndCategories = async () => {
        try {
            const authorsRes = await axios.get("http://127.0.0.1:8000/api/authors/");
            setAuthors(authorsRes.data);
            const categoriesRes = await axios.get("http://127.0.0.1:8000/api/categories/");
            setCategories(categoriesRes.data);
        } catch (err) {
            console.error("Error fetching authors or categories", err);
        }
    };

    const handleEdit = (book) => {
        setEditBook(book.id);
        setUpdatedBook({
            title: book.title,
            description: book.description,
            author_id: book.author.id,
            category_ids: book.category.map((c) => c.id),
        });
    };

    const handleChange = (e) => {
        setUpdatedBook({ ...updatedBook, [e.target.name]: e.target.value });
    };

    const handleCategoryChange = (e) => {
        const { value, checked } = e.target;
        setUpdatedBook((prev) => {
            const category_ids = checked
                ? [...prev.category_ids, parseInt(value)]
                : prev.category_ids.filter((id) => id !== parseInt(value));
            return { ...prev, category_ids };
        });
    };

    const handleUpdate = async (bookId) => {
        try {
            const response = await axios.put(
                `http://127.0.0.1:8000/api/books/${bookId}/`,
                updatedBook,
                { headers: { Authorization: `Token ${token}` } }
            );
    
            console.log("Server Response:", response); // Debugging Line
            if (response.status === 200) {
                alert("Book updated successfully!");
            } else {
                alert("Unexpected response, check console.");
            }
    
            setEditBook(null);
            fetchBooks();
        } catch (err) {
            console.error("Error updating book:", err);
            alert(`Failed to update book: ${err.response?.data?.detail || "Unknown error"}`);
        }
    };        

    const handleDelete = async (bookId) => {
        if (!window.confirm("Are you sure you want to delete this book?")) return;
        try {
            await axios.delete(`http://127.0.0.1:8000/api/books/${bookId}/`, {
                headers: { Authorization: `Token ${token}` },
            });
            alert("Book deleted successfully!");
            fetchBooks();
        } catch (err) {
            console.error("Error deleting book", err);
            alert("Failed to delete book");
        }
    };

    return (
        <div className="admin-book-management">
            <h2>Manage Books</h2>
            <ul className="book-list">
                {books.map((book) => (
                    <li key={book.id} className="book-item">
                        {editBook === book.id ? (
                            <>
                                {/* Book Title */}
                                <div className="form-group">
                                    <label htmlFor={`title-${book.id}`}>Title:</label>
                                    <input
                                        type="text"
                                        id={`title-${book.id}`}
                                        name="title"
                                        value={updatedBook.title}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Book Description */}
                                <div className="form-group">
                                    <label htmlFor={`description-${book.id}`}>Description:</label>
                                    <textarea
                                        id={`description-${book.id}`}
                                        name="description"
                                        value={updatedBook.description}
                                        onChange={handleChange}
                                    ></textarea>
                                </div>

                                {/* Author Selection */}
                                <div className="form-group">
                                    <label htmlFor={`author-${book.id}`}>Author:</label>
                                    <select
                                        id={`author-${book.id}`}
                                        name="author_id"
                                        value={updatedBook.author_id}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Author</option>
                                        {authors.map((author) => (
                                            <option key={author.id} value={author.id}>
                                                {author.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Categories (Checkboxes) */}
                                <div className="form-group category-container">
                                    <label>Categories:</label>
                                    {categories.map((category) => (
                                        <label key={category.id}>
                                            <input
                                                type="checkbox"
                                                value={category.id}
                                                checked={updatedBook.category_ids.includes(category.id)}
                                                onChange={handleCategoryChange}
                                            />
                                            {category.name}
                                        </label>
                                    ))}
                                </div>

                                {/* Action Buttons */}
                                <div className="book-actions">
                                    <button className="save-btn" onClick={() => handleUpdate(book.id)}>Save</button>
                                    <button className="cancel-btn" onClick={() => setEditBook(null)}>Cancel</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h3>{book.title}</h3>
                                <p>{book.description}</p>
                                <div className="book-actions">
                                    <button className="edit-btn" onClick={() => handleEdit(book)}>Edit</button>
                                    <button className="delete-btn" onClick={() => handleDelete(book.id)}>Delete</button>
                                </div>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AdminBookManagement;
