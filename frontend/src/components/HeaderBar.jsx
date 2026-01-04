import Link from "next/link";
import { useContext } from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { AuthContext } from "@/context/AuthContext";

export default function HeaderBar() {
  const { token, username, setToken } = useContext(AuthContext);

  return (
    <Navbar
        expand="lg"
        variant="dark"  
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
        <Navbar.Brand as={Link} href="/">
          <span
            className="
              text-6xl
              font-extrabold
              tracking-wide
              bg-gradient-to-r
              from-yellow-400
              via-red-500
              to-pink-500
              bg-clip-text
              text-transparent
              drop-shadow-lg
            "
          >
            WARdle
          </span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="wardle-navbar" />

        <Navbar.Collapse id="wardle-navbar">
          {/* NAV LINKS */}
          <Nav className="me-auto">
            <Nav.Link
                as={Link}
                href="/leaderboard"
                style={{
                    color: "white",
                    fontSize: "1.15rem",
                    fontWeight: 600,
                    fontFamily: "inherit", // match page font
                }}
            >
                Leaderboard
            </Nav.Link>
          </Nav>

          {/* AUTH */}
          <Nav className="ms-auto align-items-center">
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
