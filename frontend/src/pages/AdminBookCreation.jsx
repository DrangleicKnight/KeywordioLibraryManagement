import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./styles/AddBooks.css";

const AdminBookCreation = () => {
    const [book, setBook] = useState({
        title: "",
        author: "",
        category: [],
        description: "",
    });

    const [authors, setAuthors] = useState([]);
    const [categories, setCategories] = useState([]);

    const [newAuthor, setNewAuthor] = useState("");
    const [newCategory, setNewCategory] = useState("");
    const [showAuthorInput, setShowAuthorInput] = useState(false);
    const [showCategoryInput, setShowCategoryInput] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetchAuthors();
        fetchCategories();
    }, []);

    const fetchAuthors = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/authors/");
            setAuthors(res.data);
        } catch (err) {
            console.error("Error fetching authors", err);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/categories/");
            setCategories(res.data);
        } catch (err) {
            console.error("Error fetching categories", err);
        }
    };

    const handleChange = (e) => {
        setBook({ ...book, [e.target.name]: e.target.value });
    };

    const handleCategoryChange = (e) => {
        const selectedCategories = Array.from(e.target.selectedOptions, (option) => option.value);
        setBook({ ...book, category: selectedCategories });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("adminToken");

        if (!token) {
            alert("Unauthorized! Please log in.");
            navigate("/admin/login");
            return;
        }

        const bookData = {
            title: book.title,
            author_id: book.author,
            category_ids: book.category,
            description: book.description,
        };

        try {
            await axios.post("http://127.0.0.1:8000/api/books/create/", bookData, {
                headers: { Authorization: `Token ${token}` },
            });
            alert("Book created successfully!");
            setBook({ title: "", author: "", category: [], description: "" });
            window.location.reload();
        } catch (error) {
            console.error("Book creation failed:", error);
            alert("An error occurred. Check console.");
        }
    };

    const handleAddAuthor = async () => {
        if (!newAuthor.trim()) return;
    
        try {
            const token = localStorage.getItem("adminToken"); // Ensure token exists
            const res = await axios.post(
                "http://127.0.0.1:8000/api/authors/create/",
                { name: newAuthor },
                {
                    headers: { Authorization: `Token ${token}` }, // Ensure auth is sent
                }
            );
            console.log("Author added:", res.data); // Debugging log
            setAuthors([...authors, res.data]);
            setNewAuthor("");
            setShowAuthorInput(false);
        } catch (error) {
            console.error("Error adding author:", error.response?.data || error);
        }
    };
    

    const handleAddCategory = async () => {
    if (!newCategory.trim()) return;

    try {
        const token = localStorage.getItem("adminToken"); // Ensure token exists
        const res = await axios.post(
            "http://127.0.0.1:8000/api/categories/create/",
            { name: newCategory },
            {
                headers: { Authorization: `Token ${token}` }, // Ensure auth is sent
            }
        );
        console.log("Category added:", res.data); // Debugging log
        setCategories([...categories, res.data]);
        setNewCategory("");
        setShowCategoryInput(false);
    } catch (error) {
        console.error("Error adding category:", error.response?.data || error);
    }
};


    return (
        <div className="admin-book-container">
            <div className="admin-book-box">
                <h2>Create a New Book</h2>
                <form onSubmit={handleSubmit}>
                    <input type="text" name="title" placeholder="Book Title" onChange={handleChange} required />

                    <div className="input-group">
                        <select name="author" onChange={handleChange} required>
                            <option value="">Select Author</option>
                            {authors.map((author) => (
                                <option key={author.id} value={author.id}>
                                    {author.name}
                                </option>
                            ))}
                        </select>
                        <button type="button" className="add-btn" onClick={() => setShowAuthorInput(true)}>+</button>
                    </div>
                    {showAuthorInput && (
                        <div className="add-input-group">
                            <input
                                type="text"
                                placeholder="New Author Name"
                                value={newAuthor}
                                onChange={(e) => setNewAuthor(e.target.value)}
                            />
                            <button type="button" className="confirm-btn" onClick={handleAddAuthor}>Add</button>
                        </div>
                    )}

                    <div className="input-group">
                        <select name="category" multiple onChange={handleCategoryChange} required>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        <button type="button" className="add-btn" onClick={() => setShowCategoryInput(true)}>+</button>
                    </div>
                    {showCategoryInput && (
                        <div className="add-input-group">
                            <input
                                type="text"
                                placeholder="New Category Name"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                            />
                            <button type="button" className="confirm-btn" onClick={handleAddCategory}>Add</button>
                        </div>
                    )}

                    <textarea name="description" placeholder="Description" onChange={handleChange}></textarea>

                    <button type="submit">Create Book</button>
                </form>
            </div>
        </div>
    );
};

export default AdminBookCreation;
