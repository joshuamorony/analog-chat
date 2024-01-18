import {
	AbstractControl,
	type ValidationErrors,
	type ValidatorFn,
} from '@angular/forms';

export const passwordMatchesValidator: ValidatorFn = (
	control: AbstractControl,
): ValidationErrors | null => {
	const password = control.get('password')?.value;
	const confirmPassword = control.get('confirmPassword')?.value;

	return password && confirmPassword && password === confirmPassword
		? null
		: { passwordMatch: true };
};
