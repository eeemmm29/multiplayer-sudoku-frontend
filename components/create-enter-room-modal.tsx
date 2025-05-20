import { CreateRoomResponse, CreateEnterRoomForm, ModalMode } from "@/types";
import { Button } from "@heroui/button";
import { Form } from "@heroui/form";
import { Input } from "@heroui/input";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { NumberInput } from "@heroui/number-input";
import { Select, SelectItem } from "@heroui/select";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";

interface CreateEnterRoomModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  mode: ModalMode;
}

const CreateEnterRoomModal: React.FC<CreateEnterRoomModalProps> = ({
  isOpen,
  onOpenChange,
  onClose,
  mode,
}) => {
  const { control, handleSubmit } = useForm<CreateEnterRoomForm>();
  const router = useRouter();

  const headerText =
    mode === "create" ? "A new room will be created" : "Join a Room";

  const onSubmit = async (data: CreateEnterRoomForm) => {
    console.log("data", data);
    if (mode === "create") {
      try {
        const maxStepGap = data.maxStepGap ? Number(data.maxStepGap) : 1;
        const cooldownSeconds = data.cooldownSeconds
          ? Number(data.cooldownSeconds)
          : 10;
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/room`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              maxStepGap,
              cooldownSeconds,
              difficulty: data.difficulty ?? "EASY",
            }),
          }
        );
        if (!res.ok) throw new Error("Failed to create room");
        const response: CreateRoomResponse = await res.json();
        if (response && response.roomCode) {
          router.push(`/game?roomCode=${response.roomCode}`);
          onClose();
        }
      } catch (e) {
        alert("Failed to create room");
      }
    } else if (mode === "join") {
      router.push(`/game?roomCode=${data.roomCode}`);
      onClose();
    }
  };

  return (
    <Modal
      size="xs"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onClose={onClose}
    >
      <ModalContent>
        <ModalHeader>{headerText}</ModalHeader>
        <Form onSubmit={handleSubmit(onSubmit)}>
          {mode === "join" && (
            <ModalBody>
              <Controller
                name="roomCode"
                control={control}
                rules={{
                  required: "Room code is required",
                  minLength: { value: 4, message: "Must be 4 characters" },
                  maxLength: { value: 4, message: "Must be 4 characters" },
                  pattern: {
                    value: /^[A-Za-z0-9]{4}$/,
                    message: "Only letters and numbers allowed",
                  },
                }}
                render={({ field, fieldState: { invalid, error } }) => (
                  <Input
                    label="Room Code (4 characters)"
                    maxLength={4}
                    isInvalid={invalid}
                    errorMessage={error?.message}
                    {...field}
                  />
                )}
              />
            </ModalBody>
          )}
          {mode === "create" && (
            <ModalBody className="w-full">
              <Controller
                name="maxStepGap"
                control={control}
                defaultValue={1}
                render={({ field }) => (
                  <NumberInput
                    label="Max Step Gap (for power-up)"
                    min={1}
                    max={20}
                    // onChange={(e) =>
                    //   field.onChange(parseInt(e.target.value, 10) || 1)
                    // }
                    {...field}
                  />
                )}
              />
              <Controller
                name="cooldownSeconds"
                control={control}
                defaultValue={10}
                render={({ field }) => (
                  <NumberInput
                    label="Cooldown Seconds (for power-up)"
                    min={1}
                    max={120}
                    // onChange={(e) =>
                    //   field.onChange(parseInt(e.target.value, 10) || 1)
                    // }
                    {...field}
                  />
                )}
              />
              <Controller
                name="difficulty"
                control={control}
                defaultValue={"EASY"}
                render={({ field }) => (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      Difficulty
                    </label>
                    <Select
                      label="Select difficulty"
                      defaultSelectedKeys={["EASY"]}
                      {...field}
                    >
                      <SelectItem key="EASY">Easy</SelectItem>
                      <SelectItem key="MEDIUM">Medium</SelectItem>
                      <SelectItem key="HARD">Hard</SelectItem>
                      <SelectItem key="EXPERT">Expert</SelectItem>
                    </Select>
                  </div>
                )}
              />
            </ModalBody>
          )}
          <ModalFooter className="w-full">
            <Button color="danger" variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button color="success" type="submit">
              Submit
            </Button>
          </ModalFooter>
        </Form>
      </ModalContent>
    </Modal>
  );
};

export default CreateEnterRoomModal;
