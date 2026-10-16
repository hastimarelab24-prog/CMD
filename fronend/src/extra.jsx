await lead.save();

console.log("Lead saved successfully:", lead._id.toString());

try {
  await logActive(
    req.user.id || req.user._id,
    "LEAD_ASSIGNED",
    "Lead",
    lead._id.toString(),
    {
      previousEmployee,
      newEmployee: employee._id.toString(),
    }
  );
} catch (auditError) {
  console.error("Audit log error:", auditError);
}

return res.status(200).json({
  message: "Lead assigned successfully.",
  lead,
});