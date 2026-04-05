export default function RoleTag({ role }) {
  if (role === 'instructor') {
    return (
      <span className="badge-instructor" id={`role-tag-${role}`}>
        Instructor
      </span>
    );
  }
  return (
    <span className="badge-student" id={`role-tag-${role}`}>
      Student
    </span>
  );
}
