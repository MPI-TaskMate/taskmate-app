import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import { useAuth } from "../hooks/useAuth";
import { useTyping } from "../hooks/useTyping";
import styles from "../styles/auth.module.css";

type FormData = {
  email: string;
  password: string;
  confirmPassword: string;
};

type FormErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const typedSubtitle = useTyping("Stay organized. Stay focused.", 60);

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
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Invalid email.";
    }

    if (!form.password) {
      newErrors.password = "Password is required.";
    } else if (form.password.length < 8) {
      newErrors.password = "Min 8 characters.";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Confirm your password.";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);

      await registerUser({
        email: form.email,
        password: form.password,
      });

      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrors({ general: err.message });
      } else {
        setErrors({ general: "Something went wrong" });
      }
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
          <h1 className={styles.title}>Create account</h1>
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
            <div className={styles.field}>
              <input
                name="confirmPassword"
                type="password"
                placeholder=" "
                value={form.confirmPassword}
                onChange={handleChange}
                className={styles.input}
              />
              <label>Confirm password</label>
              {errors.confirmPassword && (
                <p className={styles.error}>{errors.confirmPassword}</p>
              )}
            </div>
            {errors.general && <p className={styles.error}>{errors.general}</p>}
            <button className={styles.button} disabled={loading}>
              {loading ? "Creating..." : "Create account"}
            </button>
          </form>
          <p className={styles.link}>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
