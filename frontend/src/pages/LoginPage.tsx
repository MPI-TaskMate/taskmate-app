import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTyping } from "../hooks/useTyping";
import styles from "../styles/auth.module.css";

type FormData = {
  email: string;
  password: string;
};

type FormErrors = {
  email?: string;
  password?: string;
  general?: string;
};

export default function LoginPage() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [form, setForm] = useState<FormData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const typedSubtitle = useTyping("Welcome back. Let’s get things done.", 60);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      general: "",
    }));
  };

  const validate = () => {
    const newErrors: FormErrors = {};

    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    }

    if (!form.password) {
      newErrors.password = "Password is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err: any) {
      setErrors({
        general: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <div className={styles.leftContent}>
          <h1 className="brand">TaskMate</h1>
          <p className={styles.typingText}>{typedSubtitle}</p>
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.formWrapper}>
          <h1 className={styles.title}>Login</h1>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <input
                name="email"
                type="email"
                placeholder=" "
                value={form.email}
                onChange={handleChange}
                className={styles.input}
              />
              <label>Email</label>
              {errors.email && <p className={styles.error}>{errors.email}</p>}
            </div>
            <div className={styles.field}>
              <input
                name="password"
                type="password"
                placeholder=" "
                value={form.password}
                onChange={handleChange}
                className={styles.input}
              />
              <label>Password</label>
              {errors.password && (
                <p className={styles.error}>{errors.password}</p>
              )}
            </div>
            {errors.general && (
              <p className={styles.error}>{errors.general}</p>
            )}
            <button className={styles.button} disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          <p className={styles.link}>
            Don’t have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}