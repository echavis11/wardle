import Link from "next/link";
import { useContext } from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { AuthContext } from "@/context/AuthContext";

export default function HeaderBar() {
  const { token, username, setToken } = useContext(AuthContext);

  return (
    <Navbar
      expand="lg"
      className="mb-4"
      style={{
        backgroundColor: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(12px)",
        borderRadius: "12px",
        padding: "0.75rem 1rem",
      }}
    >
      <Container fluid>
        {/* LEFT: LOGO */}
        <Navbar.Brand
          as={Link}
          href="/"
          style={{
            color: "#dc2626", // red
            fontWeight: 800,
            fontSize: "1.6rem",
            letterSpacing: "0.05em",
          }}
        >
          WARdle
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="wardle-navbar" />

        <Navbar.Collapse id="wardle-navbar">
          {/* CENTER / LEFT NAV */}
          <Nav className="me-auto">
            <Nav.Link
              as={Link}
              href="/leaderboard"
              style={{
                color: "#dc2626",
                fontWeight: 600,
              }}
            >
              Leaderboard
            </Nav.Link>
          </Nav>

          {/* RIGHT AUTH BUTTON */}
          <Nav className="ms-auto">
            {token ? (
              <>
                <Navbar.Text className="me-3 text-white">
                  Hi{username ? `, ${username}` : ""}
                </Navbar.Text>
                <Button
                  variant="danger"
                  onClick={() => setToken(null)}
                >
                  Log out
                </Button>
              </>
            ) : (
              <Button
                as={Link}
                href="/login"
                variant="danger"
              >
                Log in
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
