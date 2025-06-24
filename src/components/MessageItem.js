// src/components/MessageItem.js
import { Box, Avatar, Typography } from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";

export default function MessageItem({ message, self }) {
  const avatarSrc = `/uploads/${message.sender}/avatar.jpg`;
  const justify = self ? "flex-end" : "flex-start";
  const bg = self ? "#DCF8C6" : "#EEE";

  return (
    <Box display="flex" justifyContent={justify} my={1}>
      {!self && <Avatar src={avatarSrc} sx={{ width: 32, height: 32, mr: 1 }} />}
      <Box p={1} borderRadius={2} bgcolor={bg} maxWidth="75%">
        <Typography variant="body2">{message.content}</Typography>
        <Box display="flex" justifyContent="space-between" mt={0.5}>
          <Typography variant="caption">
            {new Date(message.timestamp).toLocaleTimeString()}
          </Typography>
          {self && (
            <Box display="flex" alignItems="center">
              <DoneIcon fontSize="small" sx={{ mr: 0.3 }} />
              <Typography variant="caption">
                {message.seen ? "Seen" : ""}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
